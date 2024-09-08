import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionStore } from '../session-store/session-store.service';
import { Supabase } from '../supabase';
import { AppService } from '../app.service';
import { ConfigService } from '@nestjs/config';
import { MyLoggerService } from '../my-logger/my-logger.service';
import { Connect_Dto } from './dto/connect.dto';

export interface ConnectionStatus {
  success: boolean;
  connectionID?: number;
}

@Injectable()
export class ConnectionManagerService {
  constructor(
    private readonly sessionStore: SessionStore,
    private readonly supabase: Supabase,
    private readonly config_service: ConfigService,
    private readonly app_service: AppService,
    private logger: MyLoggerService
  ) {
    this.logger.setContext(ConnectionManagerService.name);
  }

  async connectToDatabase(
    connect_dto: Connect_Dto,
    session: Record<string, any>
  ): Promise<ConnectionStatus> {

      const { data: user_data, error: user_error } = await this.supabase
        .getClient()
        .auth.getUser(this.supabase.getJwt());

      if (user_error) {
        throw user_error;
      }

      const { data: db_data, error: error } = await this.supabase
        .getClient()
        .from('db_envs')
        .select('host')
        .eq('db_id', connect_dto.databaseServerID)
        .single();
      if (error) {
        this.logger.error(error, ConnectionManagerService.name);
        throw error;
      }

      if (!db_data) {
        throw new UnauthorizedException('You do not have access to this database');
      }

      let host = db_data.host;

      if (session.host === host) {
        //-----------------------------EXISTING CONNECTION TO THE RIGHT HOST---------------------//
        //Print out that you are reconnecting to an existing session and not a new one
        this.logger.log(`[Reconnecting] ${session.id} connected to ${host}`, ConnectionManagerService.name);
        return {
          success: true,
          connectionID: this.sessionStore.get(session.id).conn.threadID
        };
      } else {
        //-------------------------NO EXISTING CONNECTION TO THE RIGHT HOST-------------------//
        if (session.host !== undefined) {
          //if there is an existing connection that needs to be changed to a different host
          this.sessionStore.get(session.id).conn.end();
          this.sessionStore.remove(session.id);
          this.logger.log(`[Connection Disconnected] ${session.id}`, ConnectionManagerService.name);
          session.host = undefined;
        }

        let user: any, password: any;

        //If database credentials are provided, then use those
        if(connect_dto.databaseServerCredentials){
          user = connect_dto.databaseServerCredentials.username;
          password = connect_dto.databaseServerCredentials.password;
        }
        //Otherwise, try find and decrypt saved credentials for the database
        else{
          try{
            let { user: decryptedUser, password: decryptedPassword } = await this.decryptDbSecrets(connect_dto.databaseServerID, session);
            user = decryptedUser;
            password = decryptedPassword;
          }
          catch(err){
            throw err;
          }
        }

        const connection = require('mysql').createConnection({
          host: host,
          user: user,
          password: password
        });

        const promise = new Promise<ConnectionStatus>((resolve, reject) => {
          connection.connect((err) => {
            //if there is an error with the connection, reject
            if (err) {
              this.logger.error(err, ConnectionManagerService.name);
              if (
                err.code == 'ER_ACCESS_DENIED_ERROR' ||
                err.code == 'ER_NOT_SUPPORTED_AUTH_MODE'
              ) {
                return reject(new UnauthorizedException('Please ensure that your database credentials are correct.'));
              } else {
                return reject(new BadGatewayException('Could not connect to the database - has your database admin added it correctly?'));
              }
            } else {
              //query the connected database if the connection is successful
              session.host = host;
  
              this.sessionStore.add({
                id: session.id,
                conn: connection
              });
  
              this.logger.log(
                `[Inital Connection] ${session.id} connected to ${host}`
              , ConnectionManagerService.name);
  
              resolve({
                success: true,
                connectionID: connection.threadID
              });
            }
          });

        });

        return await promise;

    }
  }

  async decryptDbSecrets(db_id: string, session: Record<string, any>) {

    //Get the user

    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    const user_id = user_data.user.id;

    //Get the encrypted database credentials

    const { data: db_secrets_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_access')
      .select('db_secrets')
      .eq('user_id', user_id)
      .eq('db_id', db_id);

    if (db_error) {
      throw db_error;
    }
    if (db_secrets_data.length === 0) {
      throw new UnauthorizedException(
        'Database secret not found, you do not have access to this database'
      );
    }

    const db_secrets = db_secrets_data[0].db_secrets;

    //Decrypt the database credentials

    //First check if the user has a backend session - otherwise throw an error
    //to log them in again on the frontend

    if(session.sessionKey){

      const uni_key = this.config_service.get('UNI_KEY');

      const decryptedText = this.app_service.decrypt(db_secrets, uni_key);
  
      const decryptedText2 = this.app_service.decrypt(
        decryptedText,
        session.sessionKey
      );
  
      let decryptedSecrets = JSON.parse(decryptedText2);
  
      return { user: decryptedSecrets.user, password: decryptedSecrets.password };

    }
    else{
      throw new InternalServerErrorException('You do not have a backend session');
    }

  }
}
