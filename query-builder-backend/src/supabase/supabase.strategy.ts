import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '@supabase/supabase-js';
import { MyLoggerService } from '../my-logger/my-logger.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private logger: MyLoggerService
  ) {
    super({
      supabaseUrl: configService.get('SUPABASE_URL'),
      supabaseKey: configService.get('SUPABASE_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('SUPABASE_JWT_SECRET')
    });
    this.logger.setContext(SupabaseStrategy.name);
  }

  async validate(user: AuthUser) {
    return user;
  }
}
