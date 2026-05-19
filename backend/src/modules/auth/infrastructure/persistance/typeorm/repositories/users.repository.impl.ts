import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from 'src/modules/auth/domain/repositories/users.repository';
import { User } from 'src/modules/auth/domain/user.entity';
import { Repository } from 'typeorm';
import { UserMapper } from '../user.mapper';
import { UserOrm } from '../entities/user.orm-entity';

@Injectable()
export class TypeOrmUsersRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserOrm)
    private readonly repo: Repository<UserOrm>,
  ) {}

  async findByEmail(email: string) {
    const user = await this.repo.findOneBy({ email });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async save(user: User) {
    const ormEntity = UserMapper.toOrmEntity(user);

    const saved = await this.repo.save(ormEntity);

    return UserMapper.toDomain(saved);
  }
}
