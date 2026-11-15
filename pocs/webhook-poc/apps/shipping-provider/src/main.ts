import { ShippingProviderApp } from './index.ts';

const port = Number(process.env.PORT ?? 4003);
const app = new ShippingProviderApp();
const boundPort = await app.start(port);
console.log(`[shipping-provider] listening on http://127.0.0.1:${boundPort}`);
