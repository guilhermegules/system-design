export interface Order {
  id: number;
  productId: string;
  quantity: number;
  status: "PENDING";
}

export const orders: Order[] = [];
