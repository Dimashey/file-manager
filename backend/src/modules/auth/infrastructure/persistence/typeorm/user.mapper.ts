import { User } from 'src/modules/auth/domain/user.entity';
import { UserOrm } from './entities/user.orm-entity';

export class UserMapper {
  static toDomain(entity: UserOrm): User {
    return new User(
      entity.id,
      entity.email,
      entity.password,
      entity.name,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrmEntity(user: User): UserOrm {
    const entity = new UserOrm();

    entity.id = user.id;
    entity.email = user.email;
    entity.password = user.getPasswordHash();
    entity.name = user.name;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;

    return entity;
  }
}
