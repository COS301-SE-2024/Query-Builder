import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerController } from './connection-manager.controller';

describe('ConnectionManagerController', () => {
  let controller: ConnectionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionManagerController],
    }).compile();

    controller = module.get<ConnectionManagerController>(ConnectionManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
