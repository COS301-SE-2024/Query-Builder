import { Module, Scope } from '@nestjs/common';
import { DbMetadataHandlerController } from './db-metadata-handler.controller';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { QueryHandlerModule } from '../query-handler/query-handler.module';
import { MySqlDbMetadataHandlerService } from './my-sql-db-metadata-handler/my-sql-db-metadata-handler.service';
import { PostgresDbMetadataHandlerService } from './postgres-db-metadata-handler/postgres-db-metadata-handler.service';
import { DbMetadataHandlerFactory } from './db-metadata-handler.factory';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [QueryHandlerModule, SupabaseModule],
  controllers: [DbMetadataHandlerController],
  providers: [
    {
      provide: 'DbMetadataHandlerService',
      scope: Scope.REQUEST,
      useFactory: (dbMetadataHandlerFactory: DbMetadataHandlerFactory) => {
        return dbMetadataHandlerFactory.createDbMetadataHandlerService();
      },
      inject: [DbMetadataHandlerFactory]
    },
    DbMetadataHandlerFactory,
    MySqlDbMetadataHandlerService,
    PostgresDbMetadataHandlerService
  ],
  exports: ['DbMetadataHandlerService']
})
export class DbMetadataHandlerModule {}
