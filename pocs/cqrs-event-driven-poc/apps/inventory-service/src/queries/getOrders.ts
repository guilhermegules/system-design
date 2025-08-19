import { type Order } from "@data/orders";
import { getAllOrders } from "infra/supabase/repositories/orderRepository";

export async function getOrders(): Promise<Order[]> {
  const orders = await getAllOrders();
  return orders;
}
