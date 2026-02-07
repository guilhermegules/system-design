export async function unstableApi(): Promise<string> {
  const random = Math.random();

  await new Promise((r) => setTimeout(r, 200));

  if (random < 0.5) {
    throw new Error("Remote service failed");
  }

  return "Success from remote service";
}
