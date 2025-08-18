import amqp, { Channel } from "amqplib";

let channel: Channel;

export async function connect() {
  const connection = await amqp.connect(process.env["RABBIT_MQ_URL"]!);
  channel = await connection.createChannel();
  await channel.assertExchange("orders", "topic", { durable: false });
}

export async function subscribe(
  routingKey: string,
  onMessage: (data: { productId: string; quantity: number }) => void
) {
  const { queue } = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(queue, "orders", routingKey);

  console.log(`📩 Inventory subscribed to ${routingKey}`);

  channel.consume(
    queue,
    (message) => {
      if (message?.content) {
        const data = JSON.parse(message.content.toString());
        onMessage(data);
      }
    },
    { noAck: true }
  );
}
