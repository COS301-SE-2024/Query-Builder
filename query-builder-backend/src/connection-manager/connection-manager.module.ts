import { Module } from '@nestjs/common';
import { ConnectionManagerService } from './connection-manager.service';
import { JsonConverterService } from 'src/jsonConverter/jsonConverter.service';
import { ConnectionManagerController } from './connection-manager.controller';

@Module({
  providers: [ConnectionManagerService, JsonConverterService],
  exports: [ConnectionManagerService],
  controllers: [ConnectionManagerController]
})
export class ConnectionManagerModule {}
