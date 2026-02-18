import pLimit from "p-limit";

const limit = pLimit(5);

async function callPayment() {
  await new Promise(r => setTimeout(r, 3000));
  return "payment ok";
}

async function callInventory() {
  await new Promise(r => setTimeout(r, 100));
  return "inventory ok";
}

async function orderRequest(id) {
  console.log(id)
  const payment = limit(() => callPayment());
  const inventory = limit(() => callInventory());

  const result = await Promise.all([payment, inventory]);
  console.log("order", id, result);
}

export async function runWithoutBulkhead() {
  for (let i = 0; i < 10; i++) {
    await orderRequest(i);
  }
}

