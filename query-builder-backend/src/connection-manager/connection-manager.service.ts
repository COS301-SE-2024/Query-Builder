import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionStore } from '../session-store/session-store.service';
import { Supabase } from '../supabase';
import { AppService } from '../app.service';
import { ConfigService } from '@nestjs/config';
import { MyLoggerService } from '../my-logger/my-logger.service';

export interface ConnectionStatus {
  success: boolean;
  connectionID?: number;
}

export abstract class ConnectionManagerService {
  constructor(
    protected readonly sessionStore: SessionStore,
    protected readonly supabase: Supabase,
    protected readonly config_service: ConfigService,
    protected readonly app_service: AppService,
    protected logger: MyLoggerService
  ) {
    this.logger.setContext(ConnectionManagerService.name);
  }

  //Abstract method to be implemented by all child classes using DB vendor specific implementation
  abstract connectToDatabase(db_id: string, session: Record<string, any>): Promise<ConnectionStatus>;

  //Concrete method whose implementation is inherited by all child classes
  async decryptDbSecrets(db_id: string, session: Record<string, any>) {
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    const user_id = user_data.user.id;

    const { data: db_secrets_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_access')
      .select('db_secrets')
      .eq('user_id', user_id)
      .eq('db_id', db_id);

    if (db_error) {
      throw db_error;
    }
    if (db_secrets_data.length === 0) {
      throw new UnauthorizedException(
        'Database secret not found, you do not have access to this database'
      );
    }

    const db_secrets = db_secrets_data[0].db_secrets;

    const uni_key = this.config_service.get('UNI_KEY');

    const decryptedText = this.app_service.decrypt(db_secrets, uni_key);

    const decryptedText2 = this.app_service.decrypt(
      decryptedText,
      session.sessionKey
    );

    let decryptedSecrets = JSON.parse(decryptedText2);

    return { user: decryptedSecrets.user, password: decryptedSecrets.password };
  }
}