import { Injectable, UnauthorizedException } from '@nestjs/common';
import { QueryHandlerService } from '../query-handler.service';
import { Query } from 'src/interfaces/dto/query.dto';

@Injectable()
export class PostgresQueryHandlerService extends QueryHandlerService {
    
    async queryDatabase(query: Query, session: Record<string, any>): Promise<any> {
        
        const { success, connectionID } =
        await this.connectionManagerService.connectToDatabase(
          {
            databaseServerID: query.databaseServerID,
            databaseName: query.queryParams.databaseName
          },
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
        const countResults = await connection.query(countCommand);
        const numRows = countResults.rows[0].numrows;

        //secondly, query the database
        const queryCommand = parser.convertJsonToQuery(query.queryParams);
        const queryResults = await connection.query(queryCommand);

        //add a unique key field to each returned row
        for (var i = 0; i < queryResults.rows.length; i++) {
          queryResults.rows[i].qbee_id = i;
        }

        //return a response object with numRows and results
        const response = {
          totalNumRows: numRows,
          data: queryResults.rows
        };

        return response;
    
    }

}