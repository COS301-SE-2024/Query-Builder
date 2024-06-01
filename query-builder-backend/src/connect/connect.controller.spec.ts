import { Test, TestingModule } from '@nestjs/testing';
import { ConnectController } from './connect.controller';

describe('ConnectController', () => {
  let controller: ConnectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectController],
    }).compile();

    controller = module.get<ConnectController>(ConnectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
