import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerService } from './connection-manager.service';
import { JsonConverterService } from './../jsonConverter/jsonConverter.service';
import { SessionStore } from 'src/session-store/session-store.service';

describe('ConnectionManagerService', () => {
  let service: ConnectionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionManagerService, JsonConverterService, SessionStore],
    }).compile();

    service = module.get<ConnectionManagerService>(ConnectionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
