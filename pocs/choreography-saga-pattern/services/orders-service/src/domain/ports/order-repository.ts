import { Order } from '../order';

export abstract class OrderRepository {
  abstract save(order: Order): Promise<Order>;
  abstract findById(id: string): Promise<Order | null>;
  abstract findByCustomer(customerId: string): Promise<Order[]>;
  abstract completeIfPending(id: string): Promise<boolean>;
  abstract cancelIfPending(id: string): Promise<boolean>;
}
