import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { ConfigService } from '@nestjs/config';
import { Supabase } from '../supabase';
import { mock } from 'node:test';
import { Get_User_Dto } from './dto/get-user.dto';
import {
  BadRequestException,
  HttpException,
  NotFoundException
} from '@nestjs/common';
import { Update_User_Dto } from './dto/update-user.dto';
import { sign } from 'crypto';

describe('UserManagementController', () => {
  let controller: UserManagementController;
  let service: UserManagementService;

  let mockUserService = {
    getUser: jest.fn(),
    getLoggedInUser: jest.fn(),
    genSessionKey: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    uploadProfilePhoto: jest.fn(),
    updateUserPassword: jest.fn(),
    updateUserEmail: jest.fn(),
    updateUserPhone: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserManagementController],
      providers: [
        {
          provide: UserManagementService,
          useValue: mockUserService
        },
        Supabase,
        ConfigService
      ]
    }).compile();

    controller = module.get<UserManagementController>(UserManagementController);
    service = module.get<UserManagementService>(UserManagementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should error when the Get_User_Dto has an invalid user_id', async () => {
      // Arrange
      const dto = new Get_User_Dto();
      dto.user_id = null;

      // Act
      try {
        await controller.getUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should error when the Get_User_Dto has an invalid first_name', async () => {
      // Arrange
      const dto = new Get_User_Dto();
      dto.first_name = null;

      // Act
      try {
        await controller.getUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should error when the Get_User_Dto has an invalid last_name', async () => {
      // Arrange
      const dto = new Get_User_Dto();
      dto.last_name = null;

      // Act
      try {
        await controller.getUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should error when the Get_User_Dto has an invalid email', async () => {
      // Arrange
      const dto = new Get_User_Dto();
      dto.email = null;

      // Act
      try {
        await controller.getUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should error when the Get_User_Dto has an invalid username', async () => {
      // Arrange
      const dto = new Get_User_Dto();
      dto.username = null;

      // Act
      try {
        await controller.getUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should call the service function getUser', async () => {
      // Arrange
      mockUserService.getUser.mockResolvedValue({});

      // Act
      await controller.getUser({});

      // Assert
      expect(service.getUser).toHaveBeenCalled();
    });
  });

  describe('getLoggedInUser', () => {
    it('should call the service function getLoggedInUser', async () => {
      // Arrange
      mockUserService.getLoggedInUser.mockResolvedValue({});

      // Act
      await controller.getLoggedInUser();

      // Assert
      expect(service.getLoggedInUser).toHaveBeenCalled();
    });
  });

  describe('genSessionKey', () => {
    it('should call the service function genSessionKey', async () => {
      // Arrange
      mockUserService.genSessionKey.mockResolvedValue({});

      // Act
      await controller.genSessionKey(
        { email: 'test@example.com', password: 'password' },
        {}
      );

      // Assert
      expect(service.genSessionKey).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should call the service function signIn', async () => {
      // Arrange
      mockUserService.signIn.mockResolvedValue({});

      // Act
      await controller.signIn({ email: 'test@example', password: 'password' });

      // Assert
      expect(service.signIn).toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    it('should call the service function signUp', async () => {
      // Arrange
      mockUserService.signUp.mockResolvedValue({});

      // Act
      await controller.signUp({
        email: 'test@example.com',
        password: 'password',
        first_name: 'John',
        last_name: 'Doe'
      });

      // Assert
      expect(service.signUp).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should call the service function createUser', async () => {
      // Arrange
      mockUserService.createUser.mockResolvedValue({});

      // Act
      await controller.createUser({
        email: 'test@example.com',
        password: 'password',
        first_name: 'John',
        last_name: 'Doe'
      });

      // Assert
      expect(service.createUser).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should error when the Update_User_Dto has an invalid user_id', async () => {
      // Arrange
      const dto = new Update_User_Dto();
      dto.user_id = null;

      // Act
      try {
        await controller.updateUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should error when the Update_User_Dto has an invalid username', async () => {
      // Arrange
      const dto = new Update_User_Dto();
      dto.username = null;

      // Act
      try {
        await controller.updateUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should error when the Update_User_Dto has an invalid first_name', async () => {
      // Arrange
      const dto = new Update_User_Dto();
      dto.first_name = null;

      // Act
      try {
        await controller.updateUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should error when the Update_User_Dto has an invalid last_name', async () => {
      // Arrange
      const dto = new Update_User_Dto();
      dto.last_name = null;

      // Act
      try {
        await controller.updateUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should error when the Update_User_Dto has an invalid profile_photo', async () => {
      // Arrange
      const dto = new Update_User_Dto();
      dto.profile_photo = null;

      // Act
      try {
        await controller.updateUser(dto);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should call the service function updateUser', async () => {
      // Arrange
      mockUserService.updateUser.mockResolvedValue({});

      // Act
      await controller.updateUser({});

      // Assert
      expect(service.updateUser).toHaveBeenCalled();
    });
  });

  describe('uploadProfilePhoto', () => {
    it('should call the service function uploadProfilePhoto', async () => {
      // Arrange
      mockUserService.uploadProfilePhoto.mockResolvedValue({});

      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('file content'),
        destination: '/path/to/destination',
        filename: 'test.jpg',
        path: '/path/to/destination/test.jpg',
        stream: null
      };

      // Act
      await controller.uploadProfilePhoto(file);

      // Assert
      expect(service.uploadProfilePhoto).toHaveBeenCalled();
    });
  })

  describe('updateUserPassword', () => {
    it('should call the service function updateUserPassword', async () => {
      // Arrange
      mockUserService.updateUserPassword.mockResolvedValue({});

      // Act
      await controller.updateUserPassword({});

      // Assert
      expect(service.updateUserPassword).toHaveBeenCalled();
    });
  });

  describe('updateUserEmail', () => {
    it('should call the service function updateUserEmail', async () => {
      // Arrange
      mockUserService.updateUserEmail.mockResolvedValue({});

      // Act
      await controller.updateUserEmail({});

      // Assert
      expect(service.updateUserEmail).toHaveBeenCalled();
    });
  })

  describe('updateUserPhone', () => {
    it('should call the service function updateUserPhone', async () => {
      // Arrange
      mockUserService.updateUserPhone.mockResolvedValue({});

      // Act
      await controller.updateUserPhone({});

      // Assert
      expect(service.updateUserPhone).toHaveBeenCalled();
    });
  });
});
