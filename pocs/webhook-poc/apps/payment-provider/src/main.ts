import { PaymentProviderApp } from './index.ts';

const port = Number(process.env.PORT ?? 4002);
const app = new PaymentProviderApp();
const boundPort = await app.start(port);
console.log(`[payment-provider] listening on http://127.0.0.1:${boundPort}`);
