import { Body, Controller, Get, Put, Session } from '@nestjs/common';
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

  @Put('derive-key')
  async deriveKey(@Body() body: {text: string}){
    return await this.appService.deriveKey(body.text);
  }

  @Get('has-session')
  async hasSession(@Session() session: Record<string, any>) {
    return await this.appService.has_session(session);
  }

  @Put('validate-boi')
  async validateBoi(@Body() body: any) {
    return await this.appService.validateBoi(body);
  }
}
