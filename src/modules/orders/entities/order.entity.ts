import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Table } from '../../tables/entities/table.entity';
import { OrderItem } from './order-item.entity';


export enum OrderStatus {
  PENDIENTE = 'PENDIENTE',   // Recién entra, la cocina lo ve
  PREPARANDO = 'PREPARANDO', // El cocinero lo aceptó
  LISTO = 'LISTO',           // El cocinero terminó, el mesero debe llevarlo
  ENTREGADO = 'ENTREGADO',   // El mesero lo dejó en la mesa
  PAGADO = 'PAGADO',         // Se cerró la cuenta
  CANCELADO = 'CANCELADO'    // Hubo un error o el cliente se arrepintió
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDIENTE })
  status: OrderStatus;

  @ManyToOne(() => Table, { eager: true }) 
  table: Table;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}