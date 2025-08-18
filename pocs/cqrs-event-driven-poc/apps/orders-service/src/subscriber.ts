import { InventoryItem } from "@data/inventory";
import { connect, subscribe } from "@events/eventBus";

const inventory: InventoryItem[] = [
  { productId: "A1", stock: 50 },
  { productId: "B2", stock: 30 },
];

async function handleOrderCreated(event: {
  productId: string;
  quantity: number;
}) {
  const item = inventory.find((i) => i.productId === event.productId);
  if (item && item.stock > 0) {
    item.stock -= event.quantity;
    console.log(
      `📦 Inventory updated: ${item.productId} now has ${item.stock} left`
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
