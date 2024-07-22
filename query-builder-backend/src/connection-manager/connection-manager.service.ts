import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';

interface DatabaseCredentials {
    host: string,
    user: string,
    password: string
}

export interface ConnectionStatus {
    success: boolean,
    connectionID?: number 
}

@Injectable()
export class ConnectionManagerService {

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
                  return reject(new UnauthorizedException("Please ensure that your database credentials are correct."));
                }
                else{
                  return reject(new BadGatewayException("Could not connect to the external database - are the host and port correct?"));
                }
            } else {
                resolve({ success: true, connectionID: connection.threadID }); // Resolve with connection info
            }
          });
        });
      }

}