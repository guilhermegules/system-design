import { OrderServiceApp } from './index.ts';

const port = Number(process.env.PORT ?? 4001);
const app = new OrderServiceApp();
const boundPort = await app.start(port);
console.log(`[order-service] listening on http://127.0.0.1:${boundPort}`);
