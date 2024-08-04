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

interface ConnectRequest{
  databaseServerID: string
}

export interface ConnectionStatus {
  success: boolean;
  connectionID?: number;
}

@Injectable()
export class ConnectionManagerService {
  constructor(private readonly sessionStore: SessionStore, private readonly supabase: Supabase, private readonly config_service: ConfigService, private readonly app_service: AppService) {}

  async connectToDatabase(
    db_id: string,
    session: Record<string, any>,
  ): Promise<ConnectionStatus> {
    return new Promise(async (resolve, reject) => {
      const { data: user_data, error: user_error } = await this.supabase.getClient().auth.getUser(this.supabase.getJwt());
      if (user_error) {
        return reject(user_error);
      }

      const { data: db_data, error: error } = await this.supabase.getClient().from('db_envs').select('host').eq('db_id', db_id).single();
      if(error) {
        console.log(error);
        return reject(error);
      }

      if(!db_data) {
        return reject(new UnauthorizedException('You do not have access to this database'));
      }

      let host = db_data.host;

      if (
        session.host === host
      ) {
        //-----------------------------EXISTING CONNECTION TO THE RIGHT HOST---------------------//
        //check if the hashed version of the password stored in the session matches the hash of the password in the query
          //Print out that you are reconnecting to an existing session and not a new one
          console.log(
            `[Reconnecting] ${session.id} connected to ${host}`,
          );
          return resolve({
            success: true,
            connectionID: this.sessionStore.get(session.id).conn.threadID
          });
      } else {
        //-------------------------NO EXISTING CONNECTION TO THE RIGHT HOST-------------------//
        if (session.host !== undefined) {
          //if there is an existing connection that needs to be changed to a different host
          this.sessionStore.get(session.id).conn.end();
          this.sessionStore.remove(session.id);
          console.log(`[Connection Disconnected] ${session.id}`);
          session.host = undefined;
        }

        let { user, password } = await this.decryptDbSecrets(db_id, session);

        const connection = require('mysql').createConnection({
          host: host,
          user: user,
          password: password,
        });

        connection.connect((err) => {
          //if there is an error with the connection, reject
          if (err) {
            console.log(err);
            if (
              err.code == 'ER_ACCESS_DENIED_ERROR' ||
              err.code == 'ER_NOT_SUPPORTED_AUTH_MODE'
            ) {
              return reject(
                new UnauthorizedException(
                  'Please ensure that your database credentials are correct.',
                ),
              ); // Reject with an error object
            } else {
              return reject(
                new BadGatewayException(
                  'Could not connect to the external database - are the host and port correct?',
                ),
              ); // Reject with an error object
            }
          } else {
            //query the connected database if the connection is successful
            session.host = host;

            this.sessionStore.add({
              id: session.id,
              conn: connection
            });

            console.log(
              `[Inital Connection] ${session.id} connected to ${host}`,
            );
            return resolve({ success: true, connectionID: connection.threadID });
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

    const { data: db_secrets_data, error: db_error } = await this.supabase.getClient().from('db_access').select('db_secrets').eq('user_id', user_id).eq('db_id', db_id);

    if(db_error) {
      throw db_error;
    }
    if(db_secrets_data.length === 0) {
      throw new UnauthorizedException('Database secret not found, you do not have access to this database');
    }

    const db_secrets = db_secrets_data[0].db_secrets;

    const uni_key = this.config_service.get('UNI_KEY');

    const decryptedText = this.app_service.decrypt(db_secrets, uni_key);

    const decryptedText2 = this.app_service.decrypt(decryptedText, session.sessionKey);

    let decryptedSecrets = JSON.parse(decryptedText2);

    return { user: decryptedSecrets.user, password: decryptedSecrets.password };
  }
}
