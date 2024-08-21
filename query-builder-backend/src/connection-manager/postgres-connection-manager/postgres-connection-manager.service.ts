import { Injectable } from '@nestjs/common';
import { ConnectionManagerService, ConnectionStatus } from '../connection-manager.service';

@Injectable()
export class PostgresConnectionManagerService extends ConnectionManagerService {
    connectToDatabase(db_id: string, session: Record<string, any>): Promise<ConnectionStatus> {
        throw new Error('Method not implemented.');
    }
}
