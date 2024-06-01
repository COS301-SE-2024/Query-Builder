import { Controller, Post, Body } from '@nestjs/common';

@Controller('connect')
export class ConnectController {

    @Post()
    connect(@Body() credentials: {}){
        return credentials
    }

}
