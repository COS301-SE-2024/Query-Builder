import {
  BadGatewayException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JsonConverterService } from './../jsonConverter/jsonConverter.service';
import { ConnectionManagerService } from './../connection-manager/connection-manager.service';
import { Query } from '../interfaces/intermediateJSON';
import { SessionStore } from '../session-store/session-store.service';
import { createHash } from 'crypto';
import { MyLoggerService } from '../my-logger/my-logger.service';

@Injectable()
export class QueryHandlerService {
  constructor(
    private readonly jsonConverterService: JsonConverterService,
    private readonly connectionManagerService: ConnectionManagerService,
    private readonly sessionStore: SessionStore,
    private logger: MyLoggerService
  ) {
    this.logger.setContext(QueryHandlerService.name);
  }

  queryDatabase(query: Query, session: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { success, connectionID } =
        await this.connectionManagerService.connectToDatabase(
          query.databaseServerID,
          session
        );
      if (!success) {
        return reject(
          new UnauthorizedException(
            'Please ensure that your database credentials are correct.'
          )
        );
      } else {
        return resolve(this.queryHelper(query, session));
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

        //thirdly, query the database

        let queryCommand: string;

        try {
          queryCommand = parser.convertJsonToQuery(query.queryParams);
        } catch (e) {
          return reject(e);
        }

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
            data: results
          };

          return resolve(response);
        });
      });
    });
  }
}
