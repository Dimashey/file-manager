/* eslint-disable @typescript-eslint/unbound-method */
import { RegisterUseCase } from './register.use-case';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { HashService } from '../interfaces/hash.service';
import { TokenService } from '../interfaces/token.service';
import { RegisterCommand } from '../commands/register.command';
import { EmailAlreadyExistsError } from '../../domain/errors/email-already-exists.error';
import { User } from '../../domain/user.entity';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
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

    registerUseCase = new RegisterUseCase(usersRepository, hashService, tokenService);
  });

  describe('execute', () => {
    const registerCommand: RegisterCommand = {
      email: 'new@example.com',
      password: 'securePassword123',
      name: 'New User',
    };

    it('should register successfully and return a token when email is unique', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(null);
      hashService.hash.mockResolvedValue('hashed-password-123');
      usersRepository.save.mockImplementation((user: User) => Promise.resolve(user));
      tokenService.generate.mockResolvedValue('jwt-token-xyz');

      // Act
      const result = await registerUseCase.execute(registerCommand);

      // Assert
      expect(result).toEqual({ token: 'jwt-token-xyz' });
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(registerCommand.email);
      expect(hashService.hash).toHaveBeenCalledWith(registerCommand.password);
      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerCommand.email,
          name: registerCommand.name,
        }),
      );
      expect(tokenService.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerCommand.email,
        }),
      );
    });

    it('should throw EmailAlreadyExistsError when the email is already registered', async () => {
      // Arrange
      const existingUser = new User(
        'existing-uuid',
        'new@example.com',
        'already-hashed-pwd',
        'Existing User',
        new Date(),
        new Date(),
      );
      usersRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(registerUseCase.execute(registerCommand)).rejects.toThrow(
        EmailAlreadyExistsError,
      );
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(registerCommand.email);
      expect(hashService.hash).not.toHaveBeenCalled();
      expect(usersRepository.save).not.toHaveBeenCalled();
      expect(tokenService.generate).not.toHaveBeenCalled();
    });
  });
});
