import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonConverterService } from './../jsonConverter/jsonConverter.service';
import { Query } from '../interfaces/intermediateJSON';
import { SessionStore } from '../session-store/session-store.service';
import { createHash } from 'crypto';

@Injectable()
export class QueryHandlerService {
  constructor(
    private readonly jsonConverterService: JsonConverterService,
    private readonly sessionStore: SessionStore,
  ) {}

  queryDatabase(query: Query, session: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      //check if the host and username stored in the session match those of the query's credentials
      if (
        session.host === query.credentials.host &&
        session.user === query.credentials.user
      ) {
        //---------------------------------EXISTING CONNECTION---------------------------------//
        //check if the hashed version of the password stored in the session matches the hash of the password in the query
        if (
          session.pass ===
          createHash('sha256').update(query.credentials.password).digest('hex')
        ) {
          //Print out that you are reconnecting to an existing session and not a new one
          console.log(
            `[Reconnecting] ${query.credentials.user} connected to ${query.credentials.host}`,
          );
          return resolve(this.queryHelper(query, session));
        } else {
          return reject(
            new UnauthorizedException(
              'Please ensure that your database credentials are correct.',
            ),
          ); // Reject with an error object
        }
      } else {
        //---------------------------------NO EXISTING CONNECTION---------------------------------//
        if (session.connected === true) {
          this.sessionStore.get(session.id).conn.end();
          this.sessionStore.remove(session.id);
          console.log(`[Connection Disconnected] ${session.id}`);
          session.connected = false;
          session.host = undefined;
          session.user = undefined;
          session.pass = undefined;
        }

        const connection = require('mysql').createConnection({
          host: query.credentials.host,
          user: query.credentials.user,
          password: query.credentials.password,
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
            session.connected = true;
            session.host = query.credentials.host;
            session.user = query.credentials.user;
            session.pass = createHash('sha256')
              .update(query.credentials.password)
              .digest('hex');

            this.sessionStore.add({
              id: session.id,
              pass: query.credentials.password,
              conn: connection,
            });

            console.log(
              `[Inital Connection] ${query.credentials.user} connected to ${query.credentials.host}`,
            );
            return resolve(this.queryHelper(query, session));
          }
        });
      }
    });
  }

  queryHelper(query: Query, session: Record<string, any>): Promise<any> {
    const parser = this.jsonConverterService;

    return new Promise(async (resolve, reject) => {
      //first, use the correct database as specified in query
      const databaseToQuery: string = query.queryParams.databaseName;
      const useCommand: string = 'USE ' + databaseToQuery + ';';

      let connection = this.sessionStore.get(session.id).conn;

      connection.query(useCommand, function (error, results, fields) {
        if (error) {
          return reject(error);
        }
      });

      //secondly, get the number of rows of data
      const countCommand: string = `SELECT COUNT(*) AS numRows FROM ${query.queryParams.table.name}`;
      connection.query(countCommand, async function (error, results, fields) {
        if (error) {
          return reject(error);
        }

        const numRows = results[0].numRows;

        console.log(numRows);

        //thirdly, query the database

        let queryCommand: string;

        try {
          queryCommand = parser.convertJsonToQuery(query.queryParams);
        } catch (e) {
          return reject(e);
        }

        console.log(queryCommand);
        connection.query(queryCommand, function (error, results, fields) {
          if (error) {
            return reject(error);
          }

          //add a unique key field to each returned row
          for (var i = 0; i < results.length; i++) {
            results[i].qbee_id = i; // Add "total": 2 to all objects in array
          }

          //return a response object with numRows and results
          const response = {
            totalNumRows: numRows,
            data: results,
          };

          return resolve(response);
        });
      });
    });
  }
}
