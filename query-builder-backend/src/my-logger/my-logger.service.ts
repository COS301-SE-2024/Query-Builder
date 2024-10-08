import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLoggerService extends ConsoleLogger {
  log(message: any, context?: string) {
    const entry = `${context}\t${message}`;
    this.logToFile(entry);

    super.log(message, context);
  }

  error(message: any, stackOrContext?: string) {
    const entry = `${stackOrContext}\t${message}`;
    this.logToFile(entry);

    super.error(message, stackOrContext);
  }

  async logToFile(entry) {
    const formattedEntry = `${Intl.DateTimeFormat('en-UK', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'Africa/Johannesburg'
    }).format(new Date())}\t${entry}\n`;

    try {
      if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'));
      }
      await fsPromises.appendFile(
        path.join(__dirname, '..', '..', 'logs', 'myLogs.log'),
        formattedEntry
      );
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  }
}
