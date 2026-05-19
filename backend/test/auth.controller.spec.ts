import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/modules/auth/presentation/auth.controller';
import { LoginUseCase } from '../src/modules/auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '../src/modules/auth/application/use-cases/register.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let registerUseCase: jest.Mocked<RegisterUseCase>;

  beforeEach(async () => {
    loginUseCase = {
      execute: jest.fn(),
    } as any;
    registerUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUseCase, useValue: loginUseCase },
        { provide: RegisterUseCase, useValue: registerUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should create a user and return a token', async () => {
      registerUseCase.execute.mockResolvedValue({ token: 'mock-token' });

      const result = await controller.register({
        email: 'a@b.com',
        password: 'pass123',
        name: 'A',
      });

      expect(result).toEqual({ token: 'mock-token' });
      expect(registerUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      loginUseCase.execute.mockResolvedValue({ token: 'mock-token' });

      const result = await controller.login({ email: 'a@b.com', password: 'pass123' });

      expect(result).toEqual({ token: 'mock-token' });
      expect(loginUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('should return user profile without password', () => {
      const user = {
        id: 'uuid-1',
        email: 'a@b.com',
        name: 'A',
        getPasswordHash: () => 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = controller.me(user);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('email', 'a@b.com');
      expect(result).toHaveProperty('id', 'uuid-1');
      expect(result).toHaveProperty('name', 'A');
    });
  });
});
