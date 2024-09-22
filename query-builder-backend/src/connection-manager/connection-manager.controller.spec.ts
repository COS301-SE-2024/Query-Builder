import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerController } from './connection-manager.controller';
import { Connect_Dto } from './dto/connect.dto';

describe('ConnectionManagerController', () => {
  let controller: ConnectionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionManagerController],
      providers: [
        {
          provide: 'ConnectionManagerService',
          useValue: {
            connectToDatabase(connect_dto: Connect_Dto, session: Record<string, any>){}
          }
        }
      ]
    }).compile();

    controller = module.get<ConnectionManagerController>(
      ConnectionManagerController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});
