import { Injectable } from '@nestjs/common';
import { TokenService } from '../../application/interfaces/token.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generate(payload: { sub: string; email: string }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
