import { Inject, Injectable, Logger, Scope } from "@nestjs/common";
import { Request } from "express";
import { REQUEST } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { ExtractJwt } from "passport-jwt";

@Injectable({ scope: Scope.REQUEST })
export class Supabase {
  private clientInstance: SupabaseClient;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) {}

  getClient() {
    if (this.clientInstance) {
      return this.clientInstance;
    }

    this.clientInstance = createClient(
      this.configService.get("SUPABASE_URL"),
      this.configService.get("SUPABASE_KEY"),
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
        global: {
          headers: { Authorization: `Bearer ${ExtractJwt.fromAuthHeaderAsBearerToken()(this.request)}`}
        }
      },
    );

    return this.clientInstance;
  }

  getJwt() {
    return ExtractJwt.fromAuthHeaderAsBearerToken()(this.request);
  }
}
