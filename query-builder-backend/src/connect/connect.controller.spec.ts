import { Test, TestingModule } from '@nestjs/testing';
import { ConnectController } from './connect.controller';
import { ConnectionManagerService } from '../connection-manager/connection-manager.service';
import { JsonConverterService } from 'src/jsonConverter/jsonConverter.service';

describe('ConnectController', () => {
  let controller: ConnectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionManagerService, JsonConverterService],
      controllers: [ConnectController],
    }).compile();

    controller = module.get<ConnectController>(ConnectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('it should return a database connection failed test when given no params', async () => {
    const fakeCredentials = {
      host: "",
      user: "",
      password: ""
    };

    const expected = {success: false};

    const result = await controller.connect(fakeCredentials)

    expect(result).toEqual(expected);
  });

});
