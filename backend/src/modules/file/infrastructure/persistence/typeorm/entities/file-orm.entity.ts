import { UserOrm } from '../../../../../auth/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { FolderOrm } from '../../../../../folder/infrastructure/typeorm/entities/folder-orm.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('files')
export class FileOrm {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  originalName!: string;

  @Column()
  mimeType!: string;

  @Column()
  extension!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column()
  storagePath!: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnailPath!: string | null;

  @Column({ type: 'uuid', nullable: true })
  folderId!: string | null;

  @ManyToOne(() => FolderOrm, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'folderId' })
  folder!: FolderOrm | null;

  @Column({ type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => UserOrm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner!: UserOrm;

  @Column({ default: false })
  isPublic!: boolean;

  @Column({ default: 0 })
  position!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
