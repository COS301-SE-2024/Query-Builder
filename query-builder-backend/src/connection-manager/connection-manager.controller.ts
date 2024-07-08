import { BadGatewayException, Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
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
        try {
            const result = await this.connectionManagerService.connectToDatabase(
                credentials,
            );
            return result;
        } catch (error) {
            if (error.errorCode == "Access Denied") {
                throw new UnauthorizedException(
                    "Please ensure that your database credentials are correct.",
                );
            } else {
                console.log(error);
                throw new BadGatewayException(
                    "Could not connect to the external database - are the host and port correct?",
                );
            }
        }
    }

}