import { Controller, Post, Body, Injectable, Req } from '@nestjs/common';
import { ConnectionManagerService } from '../connection-manager/connection-manager.service';

interface DatabaseCredentials {
    host: string,
    user: string,
    password: string
}

@Controller('connect')
export class ConnectController {

    constructor(private readonly connectionManager: ConnectionManagerService){}

    @Post()
    async connect(@Req() request: Request, @Body() credentials: DatabaseCredentials){

        console.log(request)

        try{
            const result = await this.connectionManager.connectToDatabase(credentials);
            return result;
        }
        catch(error){
            return error;
        }
    }

}
