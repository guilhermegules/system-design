import { OrderItem } from '../domain/order';

export interface CreateOrderCommand {
  customerId: string;
  items: OrderItem[];
  simulate?: string;
}
