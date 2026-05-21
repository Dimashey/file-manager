/* eslint-disable @typescript-eslint/unbound-method */
import { LoginUseCase } from './login.use-case';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { HashService } from '../interfaces/hash.service';
import { TokenService } from '../interfaces/token.service';
import { LoginCommand } from '../commands/login.command';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { User } from '../../domain/user.entity';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;
  let hashService: jest.Mocked<HashService>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    hashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    tokenService = {
      generate: jest.fn(),
    };

    loginUseCase = new LoginUseCase(usersRepository, hashService, tokenService);
  });

  describe('execute', () => {
    const loginCommand: LoginCommand = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = new User(
      'user-uuid',
      'test@example.com',
      'hashed-password',
      'Test User',
      new Date(),
      new Date(),
    );

    it('should execute successfully and return a token when credentials are valid', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      tokenService.generate.mockResolvedValue('jwt-token-xyz');

      // Act
      const result = await loginUseCase.execute(loginCommand);

      // Assert
      expect(result).toEqual({ token: 'jwt-token-xyz' });
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(loginCommand.email);
      expect(hashService.compare).toHaveBeenCalledWith(loginCommand.password, 'hashed-password');
      expect(tokenService.generate).toHaveBeenCalledWith({
        sub: 'user-uuid',
        email: 'test@example.com',
      });
    });

    it('should throw InvalidCredentialsError when user is not found by email', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginUseCase.execute(loginCommand)).rejects.toThrow(InvalidCredentialsError);
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(loginCommand.email);
      expect(hashService.compare).not.toHaveBeenCalled();
      expect(tokenService.generate).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when password comparison fails', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(loginUseCase.execute(loginCommand)).rejects.toThrow(InvalidCredentialsError);
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(loginCommand.email);
      expect(hashService.compare).toHaveBeenCalledWith(loginCommand.password, 'hashed-password');
      expect(tokenService.generate).not.toHaveBeenCalled();
    });
  });
});
