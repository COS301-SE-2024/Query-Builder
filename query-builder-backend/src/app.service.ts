import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validate } from 'class-validator';
import {
  sign,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt
} from 'crypto';
import { promisify } from 'util';
import { plainToInstance } from 'class-transformer';
import { QueryParams } from './interfaces/dto/query.dto';

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
      this.configService.get('SUPABASE_JWT_SECRET')
    );

    return token;
  }

  // * This function is not used in the app - is an example of how to validate a DTO
  // async validateDTO(body: any){
  //   const obj = plainToInstance(QueryParams, body);
  //   await validate(obj).then((errors) => {
  //     if (errors.length > 0) {
  //       throw new HttpException({ message: 'Validation failed', errors }, 400);
  //     }
  //     else{
  //       return { message: 'Validation passed' };
  //     }
  //   });

  //   return {message: 'Validation passed'};
  // }

  async deriveKey(text: string) {
    //generate a session key using a key derivation function
    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = (await promisify(scrypt)(text, 'salt', 32)) as Buffer;
    // console.log(key);
    // console.log('first key length' + key.length);

    return key.toString('base64');
  }

  async has_session(session: Record<string, any>) {
    if (session.sessionKey) {
      return {
        has_session: true
      };
    } else {
      return {
        has_session: false
      };
    }
  }

  encrypt(text: string, key: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(
      'aes-256-cbc',
      Buffer.from(key, 'base64'),
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString('hex');
  }

  decrypt(data: string, key: string): string {
    const buffer = Buffer.from(data, 'hex');
    const iv = buffer.subarray(0, 16);
    const encryptedData = buffer.subarray(16);
    const decipher = createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key, 'base64'),
      iv
    );
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
