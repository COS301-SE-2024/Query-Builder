import { Injectable, UnauthorizedException } from '@nestjs/common';
import { QueryHandlerService } from '../query-handler.service';
import { Query } from '../../interfaces/dto/query.dto';

@Injectable()
export class MySqlQueryHandlerService extends QueryHandlerService {
    
      async queryDatabase(
        query: Query,
        session: Record<string, any>
      ): Promise<any> {
        const { success, connectionID } =
          await this.connectionManagerService.connectToDatabase(
            { databaseServerID: query.databaseServerID },
            session
          );
    
        if (!success) {
          throw new UnauthorizedException(
            'Please ensure that your database credentials are correct.'
          );
        } else {
          return await this.queryHelper(query, session);
        }
      }
    
      async queryHelper(query: Query, session: Record<string, any>): Promise<any> {
        const parser = this.jsonConverterService;
    
        let connection = this.sessionStore.get(session.id).conn;
    
        //firstly, get the number of rows of data that would be returned without pagination
        const countCommand: string = parser.convertJsonToCountQuery(query.queryParams);
    
        const promise2 = new Promise((resolve, reject) => {
          connection.query(countCommand, async function (error, results, fields) {
            if (error) {
              return reject(error);
            }
    
            const numRows = results[0].numRows;
    
            //secondly, query the database
    
            let queryCommand: string;
    
            try {
              queryCommand = parser.convertJsonToQuery(query.queryParams);
            } catch (e) {
              return reject(e);
            }
    
            const promise3 = new Promise((resolve, reject) => {
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
    
                resolve(response);
              });
            });
    
            try {
              const queryResults = await promise3;
              resolve(queryResults);
            } catch (error) {
              return reject(error);
            }
          });
        });
    
        return await promise2;
      }
}