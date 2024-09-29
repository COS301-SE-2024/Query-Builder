import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { QueryHandlerService } from '../query-handler.service';
import { Query } from 'src/interfaces/dto/query.dto';

interface PreparedStatement {
  queryString: string,
  parameters: any[]
}

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
        const countCommand: PreparedStatement = parser.convertJsonToCountQuery(query.queryParams);
        let countResults: any;
        //try the query
        try{
          countResults = await connection.query(countCommand.queryString, countCommand.parameters);
        }
        catch(e){
          if(e.code === '21000'){
            throw new InternalServerErrorException(
              'Your saved query should only return a single row to be used as a subquery in this case'
            );
          }
          else{
            // console.log(e)
            // console.log(countCommand);
            throw new InternalServerErrorException('Please check your query and try again');
          }
        }
        const numRows = countResults.rows[0].numrows;

        //secondly, query the database
        const queryCommand: PreparedStatement = parser.convertJsonToQuery(query.queryParams);
        let queryResults: any;
        //try the query
        try{
          queryResults = await connection.query(queryCommand.queryString, queryCommand.parameters);
        }
        catch(e){
          if(e.code === '21000'){
            throw new InternalServerErrorException(
              'Your saved query should only return a single row to be used as a subquery in this case'
            );
          }
          else{
            throw new InternalServerErrorException('Please check your query and try again');
          }
        }

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