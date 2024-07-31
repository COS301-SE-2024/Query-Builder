import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionStore } from '../session-store/session-store.service';
import { createHash } from 'crypto';
import { Supabase } from '../supabase';
import { AppService } from '../app.service';
import { ConfigService } from '@nestjs/config';

interface DatabaseCredentials {
  host: string;
  user: string;
  password: string;
}

export interface ConnectionStatus {
  success: boolean;
  connectionID?: number;
}

@Injectable()
export class ConnectionManagerService {
  constructor(private readonly sessionStore: SessionStore, private readonly supabase: Supabase, private readonly config_service: ConfigService, private readonly app_service: AppService) {}

  connectToDatabase(
    credentials: DatabaseCredentials,
    session: Record<string, any>,
  ): Promise<ConnectionStatus> {
    return new Promise((resolve, reject) => {
      if (
        session.host === credentials.host &&
        session.user === credentials.user
      ) {
        if (
          session.pass ===
          createHash('sha256').update(credentials.password).digest('hex')
        ) {
          console.log(`[Reconnecting] ${credentials.user} connected to ${credentials.host}`);

          resolve({
            success: true,
            connectionID: this.sessionStore.get(session.id).conn
              .threadID,
          });
        } else {
          reject(
            new UnauthorizedException(
              'Please ensure that your database credentials are correct.',
            ),
          );
        }
      } else {
        if (session.connected === true) {
          this.sessionStore.get(session.id).conn.end(); // id will be sessionID
          this.sessionStore.remove(session.id); // id will be sessionID
          console.log(`[Connection Disconnected] ${session.id}`);
          session.connected = false;
          session.host = undefined;
          session.user = undefined;
          session.pass = undefined;
        }

        const connection = require('mysql').createConnection({
          host: credentials.host,
          user: credentials.user,
          password: credentials.password,
        });

        connection.connect((err) => {
          if (err) {
            console.log(err);
            if (
              err.code == 'ER_ACCESS_DENIED_ERROR' ||
              err.code == 'ER_NOT_SUPPORTED_AUTH_MODE'
            ) {
              reject(
                new UnauthorizedException(
                  'Please ensure that your database credentials are correct.',
                ),
              );
            } else {
              reject(
                new BadGatewayException(
                  'Could not connect to the external database - are the host and port correct?',
                ),
              );
            }
          } else {
            session.connected = true;
            session.host = credentials.host;
            session.user = credentials.user;
            session.pass = createHash('sha256')
              .update(credentials.password)
              .digest('hex');

            this.sessionStore.add({
              id: session.id,
              pass: credentials.password,
              conn: connection,
            });
            console.log(`[Initial Connection] ${credentials.user} connected to ${credentials.host}`);
            resolve({ success: true, connectionID: connection.threadID }); // Resolve with connection info
          }
        });
      }
    });
  }

  async decryptDbSecrets(db_id: string, session: Record<string, any>) {
    const { data: user_data, error: user_error } = await this.supabase.getClient().auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }
    
    const user_id = user_data.user.id;

    const { data: db_secrets, error: db_error } = await this.supabase.getClient().from('db_access').select('db_secrets').eq('user_id', user_id).eq('db_id', db_id);

    if(db_error) {
      throw db_error;
    }
    if(db_secrets.length === 0) {
      throw new UnauthorizedException('Database secret not found, you do not have access to this database');
    }

    const db_secret = db_secrets[0].db_secrets;

    const uni_key = this.config_service.get('UNI_KEY');

    const decryptedText = this.app_service.decrypt(db_secret, uni_key);

    const decryptedText2 = this.app_service.decrypt(decryptedText, session.sessionKey);

    return { data: decryptedText2 };
  }
}
