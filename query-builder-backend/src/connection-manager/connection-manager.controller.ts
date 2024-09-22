import {Body, Controller, Inject, Post, Put, Session, ValidationPipe} from '@nestjs/common';
import { ConnectionManagerService } from "../connection-manager/connection-manager.service";
import { Connect_Dto } from './dto/connect.dto';
import { Has_Active_Connection_Dto } from './dto/has-active-connection.dto';

@Controller()
export class ConnectionManagerController {

    constructor(@Inject('ConnectionManagerService') private readonly connectionManagerService: ConnectionManagerService) {}

    //end point to test connection to the database server
    @Put('connect')
    async connect(@Body(ValidationPipe) connect_dto: Connect_Dto, @Session() session: Record<string, any>) {
        return this.connectionManagerService.connectToDatabase(connect_dto, session);
    }

    //end point to determine whether the user has an active connection to the database server
    @Post('has-active-connection')
    async hasActiveConnection(@Body(ValidationPipe) has_active_connection_dto: Has_Active_Connection_Dto, @Session() session: Record<string, any>){
        return this.connectionManagerService.hasActiveConnection(has_active_connection_dto, session);
    }

}