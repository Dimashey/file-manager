import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthController } from '../src/modules/auth/presentation/auth.controller';
import { User } from '../src/modules/auth/domain/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let userRepo: jest.Mocked<Partial<Repository<User>>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should create a user and return a token', async () => {
      userRepo.findOne!.mockResolvedValue(null);
      userRepo.create!.mockReturnValue({ id: 'uuid-1', email: 'a@b.com', name: 'A', password: 'hashed' } as User);
      userRepo.save!.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', name: 'A', password: 'hashed' } as User);

      const result = await controller.register({ email: 'a@b.com', password: 'pass123', name: 'A' });

      expect(result).toEqual({ token: 'mock-token' });
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email exists', async () => {
      userRepo.findOne!.mockResolvedValue({ id: 'uuid-1' } as User);

      await expect(
        controller.register({ email: 'a@b.com', password: 'pass123', name: 'A' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const hashed = await bcrypt.hash('pass123', 10);
      userRepo.findOne!.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', password: hashed } as User);

      const result = await controller.login({ email: 'a@b.com', password: 'pass123' });

      expect(result).toEqual({ token: 'mock-token' });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashed = await bcrypt.hash('pass123', 10);
      userRepo.findOne!.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', password: hashed } as User);

      await expect(
        controller.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      userRepo.findOne!.mockResolvedValue(null);

      await expect(
        controller.login({ email: 'no@user.com', password: 'pass123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('should return user profile without password', () => {
      const user = { id: 'uuid-1', email: 'a@b.com', name: 'A', password: 'hashed', createdAt: new Date(), updatedAt: new Date() } as User;

      const result = controller.me(user);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', 'a@b.com');
    });
  });
});
