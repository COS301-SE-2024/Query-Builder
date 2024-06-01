import { Module } from '@nestjs/common';
import { ConnectController } from './connect.controller';

@Module({
  controllers: [ConnectController]
})
export class ConnectModule {}
