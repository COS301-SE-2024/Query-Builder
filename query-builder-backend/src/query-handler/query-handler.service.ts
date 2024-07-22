import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonConverterService } from './../jsonConverter/jsonConverter.service';
import { Query } from 'src/interfaces/intermediateJSON';

@Injectable()
export class QueryHandlerService {

    constructor(private readonly jsonConverterService: JsonConverterService){}

    queryDatabase(query: Query): Promise<any> {

        const parser = this.jsonConverterService;

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
                  return reject(new UnauthorizedException("Please ensure that your database credentials are correct.")); // Reject with an error object
                }
                else{
                  return reject(new BadGatewayException("Could not connect to the external database - are the host and port correct?")); // Reject with an error object
                }
            }
            else{
              //query the connected database if the connection is successful

              //first, use the correct database as specified in query
              const databaseToQuery: string = query.queryParams.databaseName;
              const useCommand: string = "USE " + databaseToQuery + ";";

              connection.query(useCommand, function (error, results, fields) {
                if (error){
                  return reject(error);
                };
              });

              //secondly, get the number of rows of data
              const countCommand: string = `SELECT COUNT(*) AS numRows FROM ${query.queryParams.table.name}`;
              connection.query(countCommand, async function(error, results, fields){

                if (error){
                  return reject(error);
                };

                const numRows = results[0].numRows;

                console.log(numRows);

                //thirdly, query the database

                let queryCommand: string;

                try{
                  queryCommand = parser.convertJsonToQuery(query.queryParams);
                }
                catch(e){
                  return reject(e);
                }

                console.log(queryCommand);
                connection.query(queryCommand, function (error, results, fields) {

                  if (error){
                    return reject(error);
                  };

                  //terminate the database connection
                  connection.end();

                  //add a unique key field to each returned row
                  for (var i = 0; i < results.length; i++) {
                    results[i].qbee_id = i; // Add "total": 2 to all objects in array
                  }

                  //return a response object with numRows and results
                  const response = {
                    totalNumRows: numRows,
                    data: results
                  }

                  resolve(response);

                });

              })
            }
          });

        });

      }

}