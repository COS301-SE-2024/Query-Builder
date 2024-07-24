import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerController } from './connection-manager.controller';
import { ConnectionManagerService } from './connection-manager.service';
import { SessionStore } from 'src/session-store/session-store.service';

describe('ConnectionManagerController', () => {
  let controller: ConnectionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionManagerController],
      providers: [ConnectionManagerService, SessionStore]
    }).compile();

    controller = module.get<ConnectionManagerController>(ConnectionManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
