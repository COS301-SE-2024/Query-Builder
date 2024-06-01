import { Module } from '@nestjs/common';
import { ConnectController } from './connect.controller';
import { ConnectionManagerService } from 'src/connection-manager/connection-manager.service';

@Module({
  controllers: [ConnectController],
  providers: [ConnectionManagerService]
})
export class ConnectModule {}
