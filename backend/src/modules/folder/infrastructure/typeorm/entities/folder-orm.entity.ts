import { UserOrm } from '../../../../auth/infrastructure/persistence/typeorm/entities/user.orm-entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('folders')
export class FolderOrm {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'uuid', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => FolderOrm, (folder) => folder.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent!: FolderOrm | null;

  @OneToMany(() => FolderOrm, (folder) => folder.parent)
  children!: FolderOrm[];

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
