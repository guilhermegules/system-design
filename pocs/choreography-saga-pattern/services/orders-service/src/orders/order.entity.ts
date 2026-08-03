import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

@Entity('orders')
export class Order {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  customerId: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: OrderStatus;

  @Column('jsonb')
  items: OrderItem[];

  @Column('numeric', { precision: 12, scale: 2 })
  totalAmount: number;

  @Column()
  currency: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  simulate: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
