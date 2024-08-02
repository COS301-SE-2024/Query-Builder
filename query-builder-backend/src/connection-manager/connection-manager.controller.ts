import {Body, Controller, HttpCode, Post, Session} from '@nestjs/common';
import { ConnectionManagerService } from "../connection-manager/connection-manager.service";

export interface DatabaseCredentials {
    host: string;
    user: string;
    password: string;
}

@Controller('connect')
export class ConnectionManagerController {

    constructor(private readonly connectionManagerService: ConnectionManagerService) {}

    //end point to test connection to the database server
    @HttpCode(200)
    @Post()
    async connect(@Body() credentials: DatabaseCredentials, @Session() session: Record<string, any>) {
        return this.connectionManagerService.connectToDatabase(credentials, session);
    }

}