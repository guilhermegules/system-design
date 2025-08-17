import { type Order, orders } from "@data/orders";
import { EventBus } from "@events/eventBus";

interface CreateOrderPayload {
  productId: string;
  quantity: number;
}

export function createOrder(
  { productId, quantity }: CreateOrderPayload,
  eventBus: EventBus
) {
  const order: Order = {
    id: orders.length + 1,
    productId,
    quantity,
    status: "PENDING",
  };

  orders.push(order);

  eventBus.publish("order.created", order);

  return order;
}
