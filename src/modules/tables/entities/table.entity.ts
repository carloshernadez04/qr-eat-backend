import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TableStatus {
  LIBRE = 'LIBRE',
  OCUPADA = 'OCUPADA',
}

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  number: number;

  @Column({ type: 'int', default: 4 })
  capacity: number; 

  @Column({ default: true })
  isActive: boolean; 

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.LIBRE,
  })
  status: TableStatus;

  @Column({ type: 'varchar', unique: true })
  token: string; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}