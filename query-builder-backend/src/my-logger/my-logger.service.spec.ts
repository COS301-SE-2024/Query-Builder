import { Test, TestingModule } from '@nestjs/testing';
import { MyLoggerService } from './my-logger.service';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

describe('MyLoggerService', () => {
  let service: MyLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyLoggerService]
    }).compile();

    service = await module.resolve<MyLoggerService>(MyLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should log the message and context to file', () => {
      const logSpy = jest.spyOn(service, 'log');
      const message = 'Test log message';
      const context = 'Test context';

      service.log(message, context);

      expect(logSpy).toHaveBeenCalledWith(message, context);
    });
  });

  describe('error', () => {
    it('should log an error', () => {
      const errorSpy = jest.spyOn(service, 'error');
      const message = 'Test error message';
      const trace = 'Test trace';

      service.error(message, trace);

      expect(errorSpy).toHaveBeenCalledWith(message, trace);
    });
  });

  describe('logToFile', () => {
    it('should log the entry to file', async () => {
      const message = 'Test log message';
      const context = 'Test context';
      const entry = `${context}\t${message}`;
      const appendFileSpy = jest.spyOn(service, 'logToFile');

      await service.logToFile(entry);

      expect(appendFileSpy).toHaveBeenCalledWith(entry);
    });

    it('should log an error and create logs directory if it does not exist', async () => {
      const logSpy = jest.spyOn(service, 'logToFile');
      const errorSpy = jest.spyOn(service, 'error');
      const mkdirSpy = jest
        .spyOn(fsPromises, 'mkdir')
        .mockResolvedValue(undefined);
      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      const appendFileSpy = jest
        .spyOn(fsPromises, 'appendFile')
        .mockResolvedValue(undefined);

      const message = 'Test error message';
      const stackOrContext = 'Test context';

      await service.error(message, stackOrContext);

      expect(logSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(message, stackOrContext);
      expect(existsSyncSpy).toHaveBeenCalledWith(
        path.join(__dirname, '..', '..', 'logs')
      );
      expect(mkdirSpy).toHaveBeenCalledWith(
        path.join(__dirname, '..', '..', 'logs')
      );
      expect(appendFileSpy).toHaveBeenCalled();
    });

    it('should handle errors during file operations', async () => {
      const logSpy = jest.spyOn(service, 'logToFile');
      const errorSpy = jest.spyOn(service, 'error');
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const appendFileSpy = jest
        .spyOn(fsPromises, 'appendFile')
        .mockRejectedValue(new Error('Test error'));

      const message = 'Test error message';
      const stackOrContext = 'Test context';

      await service.error(message, stackOrContext);

      expect(logSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(message, stackOrContext);
      expect(existsSyncSpy).toHaveBeenCalledWith(
        path.join(__dirname, '..', '..', 'logs')
      );
      expect(appendFileSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test error');
    });
  });
});
