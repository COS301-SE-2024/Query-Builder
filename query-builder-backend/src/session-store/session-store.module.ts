import { Global, Module } from '@nestjs/common';
import { SessionStore } from './session-store.service';

@Global()
@Module({
    providers: [SessionStore],
    exports: [SessionStore]
})
export class SessionStoreModule {}
