import { Injectable } from '@nestjs/common';
import { JsonConverterService } from 'src/jsonConverter/jsonConverter.service';

interface DatabaseCredentials {
    host: string,
    user: string,
    password: string
}

interface SortParams {
  column: string,
  direction?: "ascending"|"descending"
}

interface QueryParams {
  language: string,
  query_type: string,
  table: string,
  columns: string[],
  condition?: string,
  sortParams?: SortParams
}

interface Query {
  credentials: DatabaseCredentials,
  databaseName: string,
  queryParams: QueryParams
}

export interface ConnectionStatus {
    success: boolean,
    connectionID?: number 
}

@Injectable()
export class ConnectionManagerService {

    constructor(private readonly jsonConverterService: JsonConverterService){}

    connectToDatabase(credentials: DatabaseCredentials): Promise<ConnectionStatus> {

        return new Promise((resolve, reject) => {
          const connection = require('mysql').createConnection({
            host: credentials.host,
            user: credentials.user,
            password: credentials.password,
          });
    
          connection.connect((err) => {
            if (err) {
                console.log(err)
                if(err.code == "ER_ACCESS_DENIED_ERROR" || err.code == "ER_NOT_SUPPORTED_AUTH_MODE"){
                  reject({ errorCode: "Access Denied" }); // Reject with an error object
                }
                else{
                  reject({ errorCode: "Could not Connect" }); // Reject with an error object
                }
            } else {
                resolve({ success: true, connectionID: connection.threadID }); // Resolve with connection info
            }
          });
        });
      }

      queryDatabase(query: Query): Promise<any> {

        return new Promise(async (resolve, reject) => {

          console.log(query);

          const connection = require('mysql').createConnection({
            host: query.credentials.host,
            user: query.credentials.user,
            password: query.credentials.password
          });
    
          connection.connect((err) => {

            //if there is an error with the connection, reject
            if (err) {
                console.log(err)
                if(err.code == "ER_ACCESS_DENIED_ERROR" || err.code == "ER_NOT_SUPPORTED_AUTH_MODE"){
                  reject({ errorCode: "Access Denied" }); // Reject with an error object
                }
                else{
                  reject({ errorCode: "Could not Connect" }); // Reject with an error object
                }
            }
          });

          //query the connected database if the connection is successful

          //first, use the correct database as specified in query
          const databaseToQuery: string = query.databaseName;
          const useCommand: string = "USE " + databaseToQuery + ";";

          connection.query(useCommand, function (error, results, fields) {
            if (error) throw error;
          });

          //secondly, query the database
          const queryCommand: string = await this.jsonConverterService.convertJsonToQuery(query.queryParams);
          console.log(queryCommand);
          connection.query(queryCommand, function (error, results, fields) {
            if (error) throw error;

            //terminate the database connection
            connection.end();

            //add a unique key field to each returned row
            for (var i = 0; i < results.length; i++) {
              results[i].qbee_id = i; // Add "total": 2 to all objects in array
          }

            resolve(results);

          });

        });

      }

}