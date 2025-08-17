import { Channel, ChannelModel, connect } from "amqplib";

export interface EventBusOptions {
  url: string;
  exchange: string;
}

export class EventBus {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private exchange: string;

  constructor(private options: EventBusOptions) {
    this.exchange = options.exchange;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await connect(this.options.url);
      this.channel = await this.connection?.createChannel();

      await this.channel.assertExchange(this.exchange, "topic", {
        durable: false,
      });

      console.log(`✅ Connected to RabbitMQ exchange: ${this.exchange}`);
    } catch (error) {
      console.warn("⚠ RabbitMQ not available, using in-memory bus.", error);
      this.channel = null;
    }
  }

  publish(routingKey: string, payload: unknown): void {
    if (this.channel) {
      this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(JSON.stringify(payload))
      );
    } else {
      console.log(`[EVENT - ${routingKey}]`, payload);
    }
  }

  async close(): Promise<void> {
    await this.channel?.close();
  }
}
