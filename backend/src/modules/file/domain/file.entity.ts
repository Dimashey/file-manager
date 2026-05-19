import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrm } from '../../auth/infrastructure/persistance/typeorm/entities/user.orm-entity';
import { Folder } from '../../folder/domain/folder.entity';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  /** Unique identifier for the file */
  id!: string;

  @Column()
  /** Display name shown to the user (can be renamed) */
  name!: string;

  @Column()
  /** Original filename from the upload */
  originalName!: string;

  @Column()
  /** MIME type detected at upload time */
  mimeType!: string;

  @Column()
  /** File extension including dot, e.g. ".pdf", ".jpg" */
  extension!: string;

  @Column({ type: 'bigint' })
  /** File size in bytes */
  size!: number;

  @Column()
  /** Object key in MinIO storage bucket */
  storagePath!: string;

  @Column({ type: 'varchar', nullable: true })
  /** Compressed thumbnail path in MinIO. Only populated for image files after background job completes. */
  thumbnailPath!: string | null;

  @Column({ type: 'uuid', nullable: true })
  /** Parent folder ID. Null means the file is at root level. */
  folderId!: string | null;

  @ManyToOne(() => Folder, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'folderId' })
  folder!: Folder | null;

  @Column({ type: 'uuid' })
  /** ID of the user who owns this file */
  ownerId!: string;

  @ManyToOne(() => UserOrm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner!: UserOrm;

  @Column({ default: false })
  /** Whether this file is publicly accessible without authentication */
  isPublic!: boolean;

  @Column({ default: 0 })
  /** Sort position within the parent folder */
  position!: number;

  @CreateDateColumn()
  /** Timestamp when the file was uploaded */
  createdAt!: Date;

  @UpdateDateColumn()
  /** Timestamp of the most recent update to this file record */
  updatedAt!: Date;
}
