import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAuthApiError } from '@supabase/supabase-js';
import { sign, createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { get } from 'http';
import { stringify } from 'querystring';
import { concat, from } from 'rxjs';
import { promisify } from 'util';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {
  }

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

  async deriveKey(text: string) {

    //generate a session key using a key derivation function
    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = (await promisify(scrypt)(text, 'salt', 32)) as Buffer;
    // console.log(key);
    // console.log('first key length' + key.length);

    return key.toString('base64');
  }

  encrypt(text: string, key: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, "base64"),   
   iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString('hex');   
  }
  
  decrypt(data: string, key: string): string {
    const buffer = Buffer.from(data, 'hex');
    const iv = buffer.subarray(0, 16);
    const encryptedData = buffer.subarray(16);
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key, "base64"), iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
  
}
