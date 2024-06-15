import { Module } from '@nestjs/common';
import { ConnectController } from './connect.controller';
import { ConnectionManagerService } from 'src/connection-manager/connection-manager.service';
import { JsonConverterService } from 'src/jsonConverter/jsonConverter.service';

@Module({
  controllers: [ConnectController],
  providers: [ConnectionManagerService, JsonConverterService]
})
export class ConnectModule {}
