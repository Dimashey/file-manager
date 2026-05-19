import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';
import { HashService } from '../../application/interfaces/hash.service';

@Injectable()
export class BcryptService implements HashService {
  async hash(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
