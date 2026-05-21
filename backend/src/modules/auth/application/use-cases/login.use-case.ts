import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { HashService } from '../interfaces/hash.service';
import { TokenService } from '../interfaces/token.service';
import { LoginCommand } from '../commands/login.command';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Executes the login use case.
   * Validates the user credentials (email and password) and generates a JWT access token.
   *
   * @param dto - The login credentials including email and password.
   * @returns An object containing the generated JWT access token.
   * @throws {InvalidCredentialsError} If the user is not found or the password is incorrect.
   */
  async execute(dto: LoginCommand): Promise<{ token: string }> {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) throw new InvalidCredentialsError();

    const isValid = await this.hashService.compare(dto.password, user.getPasswordHash());

    if (!isValid) throw new InvalidCredentialsError();

    const token = await this.tokenService.generate({
      sub: user.id,
      email: user.email,
    });

    return { token };
  }
}
