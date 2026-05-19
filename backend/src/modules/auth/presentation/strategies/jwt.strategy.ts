import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** Validates JWT payload and returns the User entity attached to the request */
  async validate(payload: { sub: string }): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
