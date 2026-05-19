import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { HashService } from '../interfaces/hash.service';
import { TokenService } from '../interfaces/token.service';
import { LoginCommand } from '../dto/login.command';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

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
