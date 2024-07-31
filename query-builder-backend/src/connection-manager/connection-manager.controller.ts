import {Body, Controller, HttpCode, Post, Put, Session} from '@nestjs/common';
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
    @Put()
    async connect(@Body() db_id: string, @Session() session: Record<string, any>) {
        return this.connectionManagerService.connectToDatabase(db_id, session);
    }
}