import { Order } from '@domain/order';

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByCustomer(customerId: string): Promise<Order[]>;
  completeIfPending(id: string): Promise<boolean>;
  cancelIfPending(id: string): Promise<boolean>;
}

export const OrderRepository = 'OrderRepository';
