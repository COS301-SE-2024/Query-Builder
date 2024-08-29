import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
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

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, ConfigService]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('signJWT', () => {
    it('should return a string', () => {
      expect(typeof appController.signJWT({})).toBe('string');
    });
  });

  describe('deriveKey', () => {
    it('should return a string', async () => {
      const key = await appController.deriveKey({ text: 'test' });
      expect(typeof key).toBe('string');
    });
  });

  describe('hasSession', () => {
    it('should return an object with has_session', async () => {
      const session = { sessionKey: 'test' };
      expect(await appController.hasSession(session)).toHaveProperty(
        'has_session'
      );
    });
  });
});
