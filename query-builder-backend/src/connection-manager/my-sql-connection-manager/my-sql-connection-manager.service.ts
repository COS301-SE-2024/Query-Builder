import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConnectionManagerService, ConnectionStatus } from '../connection-manager.service';

@Injectable()
export class MySqlConnectionManagerService extends ConnectionManagerService {

    async connectToDatabase(db_id: string, session: Record<string, any>): Promise<ConnectionStatus> {
        {
            return new Promise(async (resolve, reject) => {
              const { data: user_data, error: user_error } = await this.supabase
                .getClient()
                .auth.getUser(this.supabase.getJwt());
              if (user_error) {
                return reject(user_error);
              }

              const { data: db_data, error: error } = await this.supabase
                .getClient()
                .from('db_envs')
                .select('host')
                .eq('db_id', db_id)
                .single();
              if (error) {
                this.logger.error(error, MySqlConnectionManagerService.name);
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
                this.logger.log(`[Reconnecting] ${session.id} connected to ${host}`, MySqlConnectionManagerService.name);
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
                  this.logger.log(`[Connection Disconnected] ${session.id}`, MySqlConnectionManagerService.name);
                  session.host = undefined;
                }

                let { user, password } = await this.decryptDbSecrets(db_id, session);

                const connection = require('mysql').createConnection({
                  host: host,
                  user: user,
                  password: password
                });

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
                      ); // Reject with an error object
                    } else {
                      return reject(
                        new BadGatewayException(
                          'Could not connect to the external database - are the host and port correct?'
                        )
                      ); // Reject with an error object
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
                    , MySqlConnectionManagerService.name);
                    return resolve({
                      success: true,
                      connectionID: connection.threadID
                    });
                  }
                });
              }
            });
          }
    }

}