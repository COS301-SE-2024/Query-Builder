import { Controller, Post, Body, UnauthorizedException, HttpCode, BadGatewayException } from '@nestjs/common';
import { ConnectionManagerService } from '../connection-manager/connection-manager.service';

interface DatabaseCredentials {
    host: string,
    user: string,
    password: string
}

@Controller('connect')
export class ConnectController {

    constructor(private readonly connectionManager: ConnectionManagerService){}

    @HttpCode(200)
    @Post()
    async connect(@Body() credentials: DatabaseCredentials){

        try{
            const result = await this.connectionManager.connectToDatabase(credentials);
            return result;
        }
        catch(error){
            if(error.errorCode == "Access Denied"){
                throw new UnauthorizedException("Please ensure that your database credentials are correct.");
            }
            else{
                console.log(error)
                throw new BadGatewayException("Could not connect to the external database - are the host and port correct?");
            }
        }
    }

}
