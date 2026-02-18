import pLimit from "p-limit";

const paymentPool = pLimit(2);
const inventoryPool = pLimit(5);

async function callPayment() {
    await new Promise(r => setTimeout(r, 3000));
    return "payment ok";
}

async function callInventory() {
    await new Promise(r => setTimeout(r, 100));
    return "inventory ok";
}

async function orderRequest(id) {
    const payment = paymentPool(() => callPayment());
    const inventory = inventoryPool(() => callInventory());

    const result = await Promise.all([payment, inventory]);
    console.log("order", id, result);
}

export async function runBulkhead() {
    for (let i = 0; i < 10; i++) {
        await orderRequest(i);
    }
}
