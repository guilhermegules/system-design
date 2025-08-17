import "tsconfig-paths/register";
import { createOrder } from "@commands/createOrder";
import { getOrders } from "@queries/getOrders";
import Fastify from "fastify";
import { EventBus } from "@events/eventBus";
import "dotenv/config";

const fastify = Fastify({ logger: true });

const eventBus = new EventBus({
  url: process.env["RABBIT_MQ_URL"]!,
  exchange: "orders",
});

fastify.post("/orders", async (req, reply) => {
  const { productId, quantity } = req.body as {
    productId: string;
    quantity: number;
  };
  console.log(eventBus);
  const order = createOrder({ productId, quantity }, eventBus);
  return reply.code(201).send(order);
});

fastify.get("/orders", async () => {
  return getOrders();
});

async function start() {
  await eventBus.connect();
  await fastify.listen({
    port: Number(process.env["PORT"]),
    host: process.env["HOST"] ?? "0.0.0.0",
  });
  console.log("🚀 Orders Service running at http://localhost:3000");
}

start();
