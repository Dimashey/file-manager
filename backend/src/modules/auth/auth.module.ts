import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserOrm } from './infrastructure/persistence/typeorm/entities/user.orm-entity';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { HashService } from './application/interfaces/hash.service';
import { UsersRepository } from './domain/repositories/users.repository';
import { BcryptService } from './infrastructure/crypto/bcrypt.service';
import { TypeOrmUsersRepository } from './infrastructure/persistence/typeorm/repositories/users.repository.impl';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { TokenService } from './application/interfaces/token.service';
import { JwtTokenService } from './infrastructure/jwt/jwt-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrm]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginUseCase,
    RegisterUseCase,
    {
      provide: UsersRepository,
      useClass: TypeOrmUsersRepository,
    },
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
    {
      provide: HashService,
      useClass: BcryptService,
    },
  ],
  exports: [TypeOrmModule],
})
export class AuthModule {}
