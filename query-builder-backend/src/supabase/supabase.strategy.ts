import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-local"
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthUser } from "@supabase/supabase-js";

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(SupabaseStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      supabaseUrl: configService.get("SUPABASE_URL"),
      supabaseKey: configService.get("SUPABASE_KEY"),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("SUPABASE_JWT_SECRET"),
    });
  }

  async validate(user: AuthUser) {
    return user;
  }
}
