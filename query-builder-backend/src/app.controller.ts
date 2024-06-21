import { Body, Controller, Get, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Put('sign-jwt')
  signJWT(@Body() data: {}): string {
    return this.appService.signJWT(data);
  }
}
