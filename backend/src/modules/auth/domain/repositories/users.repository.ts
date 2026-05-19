import { User } from '../user.entity';

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>;

  abstract save(user: User): Promise<User>;
}
