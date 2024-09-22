import {
  BadGatewayException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import {
  ConnectionManagerService,
  ConnectionStatus
} from '../connection-manager.service';
import { Connect_Dto } from '../dto/connect.dto';
import { Has_Active_Connection_Dto } from '../dto/has-active-connection.dto';

@Injectable()
export class MySqlConnectionManagerService extends ConnectionManagerService {

  //service to determine whether the user has an active connection to the database server
  async hasActiveConnection(
    has_active_connection_dto: Has_Active_Connection_Dto,
    session: Record<string, any>
  ) {
    const { data: db_data, error: error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('host, port')
      .eq('db_id', has_active_connection_dto.databaseServerID)
      .single();

    if (error) {
      this.logger.error(error, ConnectionManagerService.name);
      throw error;
    }

    if (!db_data) {
      throw new UnauthorizedException(
        'You do not have access to this database'
      );
    }

    let host = db_data.host;
    let port = db_data.port;

    if (session.host === host && session.port === port) {
      return { hasActiveConnection: true };
    } else {
      return { hasActiveConnection: false };
    }
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
      .select('host, port')
      .eq('db_id', connect_dto.databaseServerID)
      .single();
    if (error) {
      this.logger.error(error, MySqlConnectionManagerService.name);
      throw error;
    }
    if (!db_data) {
      throw new UnauthorizedException(
        'You do not have access to this database'
      );
    }
    let host = db_data.host;
    let port = db_data.port;
    if (session.host === host && session.port === port) {
      //-----------------------------EXISTING CONNECTION TO THE RIGHT HOST AND PORT---------------------//
      //Print out that you are reconnecting to an existing session and not a new one
      this.logger.log(
        `[Reconnecting] ${session.id} connected to ${host}:${port}`,
        MySqlConnectionManagerService.name
      );
      return {
        success: true,
        connectionID: this.sessionStore.get(session.id).conn.threadID
      };
    } else {
      //-------------------------NO EXISTING CONNECTION TO THE RIGHT HOST AND PORT-------------------//
      if (session.host !== undefined && session.port !== undefined) {
        //if there is an existing connection that needs to be changed to a different host and port
        this.sessionStore.get(session.id).conn.end();
        this.sessionStore.remove(session.id);
        this.logger.log(
          `[Connection Disconnected] ${session.id}`,
          MySqlConnectionManagerService.name
        );
        session.host = undefined;
        session.port = undefined;
      }
      let user: any, password: any;
      //If database credentials are provided, then use those
      if (connect_dto.databaseServerCredentials) {
        user = connect_dto.databaseServerCredentials.username;
        password = connect_dto.databaseServerCredentials.password;
      }
      //Otherwise, try find and decrypt saved credentials for the database
      else {
        try {
          let { user: decryptedUser, password: decryptedPassword } =
            await this.decryptDbSecrets(connect_dto.databaseServerID, session);
          user = decryptedUser;
          password = decryptedPassword;
        } catch (err) {
          throw err;
        }
      }
      const connection = require('mysql').createConnection({
        host: host,
        port: port,
        user: user,
        password: password
      });
      const promise = new Promise<ConnectionStatus>((resolve, reject) => {
        connection.connect((err) => {
          //if there is an error with the connection, reject
          if (err) {
            this.logger.error(err, MySqlConnectionManagerService.name);
            if (
              err.code == 'ER_ACCESS_DENIED_ERROR' ||
              err.code == 'ER_NOT_SUPPORTED_AUTH_MODE'
            ) {
              return reject(
                new UnauthorizedException(
                  'Please ensure that your database credentials are correct.'
                )
              );
            } else {
              return reject(
                new BadGatewayException(
                  'Could not connect to the database - has your database admin added it correctly?'
                )
              );
            }
          } else {
            //query the connected database if the connection is successful
            session.host = host;
            session.port = port;
            this.sessionStore.add({
              id: session.id,
              conn: connection
            });
            this.logger.log(
              `[Inital Connection] ${session.id} connected to ${host}:${port}`,
              MySqlConnectionManagerService.name
            );
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
}
