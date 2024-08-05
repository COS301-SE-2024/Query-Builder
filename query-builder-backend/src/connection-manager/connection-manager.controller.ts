import {Body, Controller, HttpCode, Post, Put, Session} from '@nestjs/common';
import { ConnectionManagerService } from "../connection-manager/connection-manager.service";

interface ConnectRequest{
    databaseServerID: string
}

@Controller('connect')
export class ConnectionManagerController {

    constructor(private readonly connectionManagerService: ConnectionManagerService) {}

    //end point to test connection to the database server
    @Put()
    async connect(@Body() connectRequest: ConnectRequest, @Session() session: Record<string, any>) {
        return this.connectionManagerService.connectToDatabase(connectRequest.databaseServerID, session);
    }
}