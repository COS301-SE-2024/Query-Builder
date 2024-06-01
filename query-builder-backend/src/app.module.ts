import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectModule } from './connect/connect.module';
import { ConnectionManagerModule } from './connection-manager/connection-manager.module';
import { JsonConverterModule } from './jsonConverter/jsonConverter.module';



@Module({
  imports: [ConnectModule, ConnectionManagerModule, JsonConverterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
