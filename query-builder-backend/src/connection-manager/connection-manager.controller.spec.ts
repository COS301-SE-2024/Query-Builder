import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerController } from './connection-manager.controller';
import { ConnectionManagerService } from './connection-manager.service';

describe('ConnectionManagerController', () => {
  let controller: ConnectionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionManagerController],
      providers: [ConnectionManagerService]
    }).compile();

    controller = module.get<ConnectionManagerController>(ConnectionManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
