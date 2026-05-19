import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  /** Unique identifier for the user */
  id!: string;

  @Column({ unique: true })
  /** User's email address, used for login and sharing */
  email!: string;

  @Column()
  /** Bcrypt-hashed password */
  password!: string;

  @Column()
  /** Display name */
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
