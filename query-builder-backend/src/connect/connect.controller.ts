import { Controller, Post, Body, Injectable, UnauthorizedException, ForbiddenException, HttpCode, BadRequestException, BadGatewayException } from '@nestjs/common';
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
            if(error.errorCode == "ER_ACCESS_DENIED_ERROR" || error.errorCode == "ER_NOT_SUPPORTED_AUTH_MODE"){
                throw new UnauthorizedException("Please ensure that your database credentials are correct.");
            }
            else{
                console.log(error)
                throw new BadGatewayException("Could not connect to the external database - are the host and port correct?");
            }
        }
    }

}
