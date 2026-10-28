import { NotificationServiceApp } from './index.ts';

const port = Number(process.env.PORT ?? 4004);
const app = new NotificationServiceApp();
const boundPort = await app.start(port);
console.log(`[notification-service] listening on http://127.0.0.1:${boundPort}`);
