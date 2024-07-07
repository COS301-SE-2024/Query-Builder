import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAuthApiError } from '@supabase/supabase-js';
import { sign, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { get } from 'http';
import { stringify } from 'querystring';
import { concat, from } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  signJWT(data: {}): string {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      JSON.stringify(data),
      this.configService.get('SUPABASE_JWT_SECRET'),
    );

    return token;
  }

  encrypt(data: string, key: string): string {
    const iv = randomBytes(16); // Generate random Initialization Vector (IV)
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + encrypted.toString('hex');
  }

  // Decryption function
  decrypt(encryptedData: string, key: string): string {
    const iv = Buffer.from(encryptedData.substring(0, 32), 'hex');
    encryptedData = encryptedData.substring(32);
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
