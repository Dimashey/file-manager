import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { User } from '../../domain/user.entity';
import { HashService } from '../interfaces/hash.service';
import { TokenService } from '../interfaces/token.service';
import { RegisterCommand } from '../commands/register.command';
import { EmailAlreadyExistsError } from '../../domain/errors/email-already-exists.error';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RegisterCommand): Promise<{ token: string }> {
    const existing = await this.usersRepository.findByEmail(dto.email);

    if (existing) throw new EmailAlreadyExistsError();

    const hashedPassword = await this.hashService.hash(dto.password);

    const user = new User(
      crypto.randomUUID(),
      dto.email,
      hashedPassword,
      dto.name,
      new Date(),
      new Date(),
    );

    const saved = await this.usersRepository.save(user);

    const token = await this.tokenService.generate({
      sub: saved.id,
      email: saved.email,
    });

    return { token };
  }
}
