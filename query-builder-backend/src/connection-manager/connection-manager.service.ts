import { Injectable } from '@nestjs/common';

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

          console.log(connection)
    
          connection.connect((err) => {
            if (err) {
                console.log(connection)
                console.log(err)
                reject({ success: false }); // Reject with an error object
            } else {
                resolve({ success: true, connectionID: connection.threadID }); // Resolve with connection info
            }
          });
        });
      }

}