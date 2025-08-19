import { OrderEntity, OrderFromQueue } from "@data/order";
import { connect, subscribe } from "@events/eventBus";
import { getOrderById } from "@infra/supabase/repositories/orderRepository";

async function handleOrderCreated(event: OrderFromQueue) {
  const order: OrderEntity = await getOrderById(event.productId);

  if (order && order.stock > 0) {
    order.stock -= event.quantity;
    console.log(
      `📦 Inventory updated: ${order.product_id} now has ${order.stock} left`
    );
  } else {
    console.log(
      `⚠ Product ${event.productId} not found or is empty in inventory`
    );
  }
}

async function start() {
  await connect();
  await subscribe("order.created", handleOrderCreated);
}

start();
