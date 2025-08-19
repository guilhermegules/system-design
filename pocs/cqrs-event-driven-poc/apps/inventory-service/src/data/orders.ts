export interface Order {
  productId: string;
  quantity: number;
  status: OrderType;
}

export interface OrderEntity {
  id: string;
  product_id: string;
  quantity: number;
  status: OrderType;
  updated_at: string;
}

export type OrderType = "PENDING";
