import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Tenents' })
export class Tenent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 30 })
  name: string;

  @Column('varchar', { length: 255 })
  address: string;

  @UpdateDateColumn()
  updatedAt: number;

  @CreateDateColumn()
  createdAt: number;
}
