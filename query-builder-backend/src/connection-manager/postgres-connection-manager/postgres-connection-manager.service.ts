import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ConnectionManagerService,
  ConnectionStatus
} from '../connection-manager.service';
import { Client } from 'pg';
import { Connect_Dto } from '../dto/connect.dto';

@Injectable()
export class PostgresConnectionManagerService extends ConnectionManagerService {
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
      this.logger.error(error, PostgresConnectionManagerService.name);
      throw error;
    }
    if (!db_data) {
      throw new UnauthorizedException(
        'You do not have access to this database'
      );
    }

    //the connection details we want to connect with
    let host = db_data.host;
    let port = db_data.port;
    //the default postgres database to connect to, if none is provided, is 'template1'
    let databaseName = connect_dto.databaseName ? connect_dto.databaseName : "template1";

    if (session.host === host && session.port === port && session.databaseName === databaseName) {
      //-------------EXISTING CONNECTION TO THE RIGHT HOST AND PORT AND DATABASE-------------//
      //Print out that you are reconnecting to an existing session and not a new one
      this.logger.log(
        `[Reconnecting] ${session.id} connected to ${host}:${port} ${databaseName}`,
        PostgresConnectionManagerService.name
      );
      return {
        success: true,
        connectionID: this.sessionStore.get(session.id).conn.threadID
      };
    } else {
      //----------NO EXISTING CONNECTION TO THE RIGHT HOST AND PORT AND DATABASE------------//
      if (session.host !== undefined && session.port !== undefined && session.databaseName !== undefined) {
        //if there is an existing connection that needs to be changed to a different host and port and database
        this.sessionStore.get(session.id).conn.end();
        this.sessionStore.remove(session.id);
        this.logger.log(
          `[Connection Disconnected] ${session.id}`,
          PostgresConnectionManagerService.name
        );
        session.host = undefined;
        session.port = undefined;
        session.databaseName = undefined;
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

      const postgresClient = new Client({
        user: user,
        password: password,
        host: host,
        port: port,
        database: databaseName
      });

      //try connect to the postgres database
      try{
        await postgresClient.connect();
      }
      //something went wrong with the connection
      catch(e){
        if(e.code === '28P01'){
          throw new UnauthorizedException(
            'Please ensure that your database credentials are correct.'
          );
        }
        else if(e.code === 'ECONNREFUSED'){
          throw new BadGatewayException(
            'Could not connect to the database - has your database admin added it correctly?'
          );
        }
        else{
          throw e;
        }
      }

      session.host = host;
      session.port = port;
      session.databaseName = databaseName;

      this.sessionStore.add({
        id: session.id,
        conn: postgresClient
      });

      this.logger.log(
        `[Inital Connection] ${session.id} connected to ${host}:${port} ${databaseName}`,
        PostgresConnectionManagerService.name
      );
      return {
        success: true
      };

    }
  }
}
