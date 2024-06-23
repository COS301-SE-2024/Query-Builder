import { Test, TestingModule } from '@nestjs/testing';
import { ConnectController } from './connect.controller';
import { ConnectionManagerService } from '../connection-manager/connection-manager.service';
import { JsonConverterService } from './../jsonConverter/jsonConverter.service';
import {
  BadGatewayException,
  HttpException,
  UnauthorizedException
} from '@nestjs/common';

describe('ConnectController', () => {
  let controller: ConnectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionManagerService, JsonConverterService],
      controllers: [ConnectController]
    }).compile();

    controller = module.get<ConnectController>(ConnectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('it should throw an unauthorised exception when given no params', async () => {
    const fakeCredentials = {
      host: '',
      user: '',
      password: ''
    };

    await expect(controller.connect(fakeCredentials)).rejects.toThrow(
      HttpException
    );
  });
});
