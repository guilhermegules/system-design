export interface OrderFromQueue {
  id: number;
  productId: string;
  quantity: number;
  status: "PENDING";
}

export interface Order {
  id: string;
  productId: string;
  stock: number;
  status: OrderType;
  createdAt: string;
}

export interface OrderEntity {
  id: string;
  stock: number;
  status: OrderType;
  product_id: string;
  created_at: string;
}

export type OrderType = "PENDING" | "COMPLETED";
