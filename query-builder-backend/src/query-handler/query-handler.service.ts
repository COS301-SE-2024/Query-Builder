import {
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JsonConverterService } from './../jsonConverter/jsonConverter.service';
import { ConnectionManagerService } from './../connection-manager/connection-manager.service';
import { Query } from '../interfaces/intermediateJSON';
import { SessionStore } from '../session-store/session-store.service';
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

  async queryDatabase(query: Query, session: Record<string, any>): Promise<any> {

    const { success, connectionID } =
      await this.connectionManagerService.connectToDatabase(
        query.databaseServerID,
        session
      );

    if (!success) {
      throw new UnauthorizedException('Please ensure that your database credentials are correct.');
    } else {
      return await this.queryHelper(query, session);
    }

  }

  async queryHelper(query: Query, session: Record<string, any>): Promise<any> {

    const parser = this.jsonConverterService;

    let connection = this.sessionStore.get(session.id).conn;

    //secondly, get the number of rows of data
    const countCommand: string = `SELECT COUNT(*) AS numRows FROM ${query.queryParams.table.name}`;

    const promise2 = new Promise((resolve) => {

      connection.query(countCommand, async function (error, results, fields) {
        
        if (error) {
          throw error;
        }
  
        const numRows = results[0].numRows;
  
        //thirdly, query the database
  
        let queryCommand: string;
  
        try {
          queryCommand = parser.convertJsonToQuery(query.queryParams);
        } catch (e) {
          throw e;
        }
  
        const promise3 = new Promise((resolve) => {
          connection.query(queryCommand, function (error, results, fields) {
            if (error) {
              throw error;
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
    
            resolve(response);
          });
        });

        resolve(await promise3);

      });

    });

    return await promise2;

  }
}
