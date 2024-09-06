import {Body, Controller, HttpCode, Post, Put, Session, ValidationPipe} from '@nestjs/common';
import { ConnectionManagerService } from "../connection-manager/connection-manager.service";
import { Connect_Dto } from './dto/connect.dto';

@Controller('connect')
export class ConnectionManagerController {

    constructor(private readonly connectionManagerService: ConnectionManagerService) {}

    //end point to test connection to the database server
    @Put()
    async connect(@Body(ValidationPipe) connect_dto: Connect_Dto, @Session() session: Record<string, any>) {
        return this.connectionManagerService.connectToDatabase(connect_dto, session);
    }
}