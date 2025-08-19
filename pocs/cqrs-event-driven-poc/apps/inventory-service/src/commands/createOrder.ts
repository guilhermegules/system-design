import { Order } from "@data/orders";
import { EventBus } from "@events/eventBus";
import { saveOrder } from "@infra/supabase/repositories/orderRepository";
import { getOrderProductId } from "@queries/getOrderByProductId";

interface CreateOrderPayload {
  productId: string;
  quantity: number;
}

export async function createOrder(
  { productId, quantity }: CreateOrderPayload,
  eventBus: EventBus
) {
  const order = await getOrderProductId(productId);

  if (!order) {
    throw new Error(`Product ${productId} not found.`);
  }

  const orderDto: Order = {
    productId,
    quantity: order.quantity - quantity,
    status: order.status,
  };

  await saveOrder(orderDto);

  eventBus.publish("order.created", orderDto);

  return orderDto;
}
