import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  signJWT(data: {}): string {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(JSON.stringify(data), this.configService.get("SUPABASE_JWT_SECRET"));

    return token;
  }
}
