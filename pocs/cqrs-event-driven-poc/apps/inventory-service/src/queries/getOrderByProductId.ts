import { getOrderByProductId } from "@infra/supabase/repositories/orderRepository";

export async function getOrderProductId(productId: string) {
  const order = await getOrderByProductId(productId);
  return order;
}
