import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

export interface sessionData {
  hash: string;
  conn: any;
}

interface inputData {
  id: string;
  pass: string;
  conn: any;
}

@Injectable()
export class SessionStore {
  private sessions: Map<string, sessionData> = new Map();

  get(id: string): sessionData | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): [string, sessionData][] {
    return [...this.sessions.entries()];
  }

  add(data: inputData): void {
    let hashedPass = createHash('sha256').update(data.pass).digest('hex');
    this.sessions.set(data.id, {
      hash: hashedPass,
      conn: data.conn,
    });
  }

  remove(id: string): boolean {
    return this.sessions.delete(id);
  }
}
