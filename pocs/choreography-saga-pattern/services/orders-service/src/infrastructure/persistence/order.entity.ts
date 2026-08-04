import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Order, OrderItem, OrderStatus } from '@domain/order';

@Entity('orders')
export class OrderEntity {
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

  static fromDomain(order: Order): OrderEntity {
    const entity = new OrderEntity();
    entity.id = order.id;
    entity.customerId = order.customerId;
    entity.status = order.status;
    entity.items = order.items;
    entity.totalAmount = order.totalAmount;
    entity.currency = order.currency;
    entity.simulate = order.simulate;
    entity.createdAt = order.createdAt;
    entity.updatedAt = order.updatedAt;
    return entity;
  }

  toDomain(): Order {
    return new Order(
      this.id,
      this.customerId,
      this.status,
      this.items,
      Number(this.totalAmount),
      this.currency,
      this.simulate,
      this.createdAt,
      this.updatedAt,
    );
  }
}
