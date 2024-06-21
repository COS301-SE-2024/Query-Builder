import { Module } from '@nestjs/common';
import { ConnectionManagerService } from './connection-manager.service';
import { JsonConverterService } from 'src/jsonConverter/jsonConverter.service';

@Module({
  providers: [ConnectionManagerService, JsonConverterService],
  exports: [ConnectionManagerService]
})
export class ConnectionManagerModule {}
