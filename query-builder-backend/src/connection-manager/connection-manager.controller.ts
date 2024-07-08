import {Body, Controller, HttpCode, Post} from '@nestjs/common';
import { ConnectionManagerService } from "../connection-manager/connection-manager.service";

interface DatabaseCredentials {
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
    async connect(@Body() credentials: DatabaseCredentials) {
        return this.connectionManagerService.connectToDatabase(credentials);
    }

}