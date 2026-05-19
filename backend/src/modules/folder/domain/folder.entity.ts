import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  /** Unique identifier for the folder */
  id!: string;

  @Column()
  /** Display name of the folder */
  name!: string;

  @Column({ type: 'uuid', nullable: true })
  /** Parent folder ID. Null means root-level folder. */
  parentId!: string | null;

  @ManyToOne(() => Folder, (folder) => folder.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent!: Folder | null;

  @OneToMany(() => Folder, (folder) => folder.parent)
  children!: Folder[];

  @Column({ type: 'uuid' })
  /** ID of the user who owns this folder */
  ownerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @Column({ default: false })
  /** Whether this folder is publicly accessible without authentication */
  isPublic!: boolean;

  @Column({ default: 0 })
  /** Sort position within the parent folder. Lower values appear first. */
  position!: number;

  @CreateDateColumn()
  /** Timestamp when the folder was created */
  createdAt!: Date;

  @UpdateDateColumn()
  /** Timestamp of the most recent update to this folder */
  updatedAt!: Date;
}
