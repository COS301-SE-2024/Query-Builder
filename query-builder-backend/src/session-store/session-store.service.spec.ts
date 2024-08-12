import { Test, TestingModule } from '@nestjs/testing';
import { SessionStore } from './session-store.service';

describe('SessionStore', () => {
  let service: SessionStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [SessionStore]
    }).compile();

    service = await module.resolve<SessionStore>(SessionStore);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    beforeEach(() => {
      service.add({ id: '1234', conn: 'test' });
    });

    it('should return the session data', () => {
      const session = service.get('1234');
      expect(session).toBeDefined();
      expect(session.conn).toBe('test');
    });
  });

  describe('getAllSessions', () => {
    beforeEach(() => {
      service.add({ id: '1234', conn: 'test' });
      service.add({ id: '5678', conn: 'test2' });
    });

    it('should return all sessions', () => {
      const sessions = service.getAllSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions[0][0]).toBe('1234');
      expect(sessions[1][0]).toBe('5678');
    });
  });

  describe('add', () => {
    it('should add a session', () => {
      service.add({ id: '1234', conn: 'test' });
      const session = service.get('1234');
      expect(session).toBeDefined();
      expect(session.conn).toBe('test');
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      service.add({ id: '1234', conn: 'test' });
    });

    it('should remove a session', () => {
      service.remove('1234');
      const session = service.get('1234');
      expect(session).toBeUndefined();
    });
  });
});
