import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    {
      return new Promise(async (resolve, reject) => {
        const { data: user_data, error: user_error } = await this.supabase
          .getClient()
          .auth.getUser(this.supabase.getJwt());
        if (user_error) {
          return reject(user_error);
        }
        //dad

        const { data: db_data, error: error } = await this.supabase
          .getClient()
          .from('db_envs')
          .select('host')
          .eq('db_id', connect_dto.databaseServerID)
          .single();
        if (error) {
          this.logger.error(error, PostgresConnectionManagerService.name);
          return reject(error);
        }

        if (!db_data) {
          return reject(
            new UnauthorizedException('You do not have access to this database')
          );
        }

        let host = db_data.host;

        if (session.host === host) {
          //-----------------------------EXISTING CONNECTION TO THE RIGHT HOST---------------------//
          //check if the hashed version of the password stored in the session matches the hash of the password in the query
          //Print out that you are reconnecting to an existing session and not a new one
          this.logger.log(
            `[Reconnecting] ${session.id} connected to ${host}`,
            PostgresConnectionManagerService.name
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
            this.logger.log(
              `[Connection Disconnected] ${session.id}`,
              PostgresConnectionManagerService.name
            );
            session.host = undefined;
          }

          let { user, password } = await this.decryptDbSecrets(connect_dto.databaseServerID, session);

          const postgresClient = new Client({
            user: user,
            password: password,
            host: host,
            port: 0,
            database: ''
          });

          try {
            await postgresClient.connect();
            session.host = host;

            this.sessionStore.add({
              id: session.id,
              conn: postgresClient
            });

            this.logger.log(
              `[Inital Connection] ${session.id} connected to ${host}`,
              PostgresConnectionManagerService.name
            );
            return resolve({
              success: true
            });
          } catch (error) {
            return reject(error);
          }
        }
      });
    }
  }
}
