import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectModule } from './connect/connect.module';
import { ConnectionManagerModule } from './connection-manager/connection-manager.module';

@Module({
  imports: [ConnectModule, ConnectionManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
