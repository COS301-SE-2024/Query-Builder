import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key: string) => {
      if (key === 'SUPABASE_JWT_SECRET') {
        return 'test-secret';
      }
      return;
    })
  }))
}));

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService, ConfigService]
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  describe('signJWT', () => {
    it('should return a string', () => {
      expect(typeof appService.signJWT({})).toBe('string');
    });

    it('should return a JWT', () => {
      const jwt = appService.signJWT({});
      const parts = jwt.split('.');

      expect(parts.length).toBe(3);
    });
  });

  describe('deriveKey', () => {
    it('should return a string', async () => {
      const key = await appService.deriveKey('test');
      expect(typeof key).toBe('string');
    });

    it('should return a base64 string', async () => {
      const key = await appService.deriveKey('test');
      const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      expect(base64Regex.test(key)).toBe(true);
    });
  });

  describe('has_session', () => {
    it('should return an object with has_session key (true)', async () => {
      const session = { sessionKey: 'test' };
      const result = await appService.has_session(session);

      expect(result).toEqual({ has_session: true });
    });

    it('should return an object with has_session key (false)', async () => {
      const session = {};
      const result = await appService.has_session(session);

      expect(result).toEqual({ has_session: false });
    });
  });
  
  describe('encrypt', () => {});
  describe('decrypt', () => {});
});
