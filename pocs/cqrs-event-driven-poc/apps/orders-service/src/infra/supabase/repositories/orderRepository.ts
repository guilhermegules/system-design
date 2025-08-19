import { Order } from "@data/order";
import { supabase } from "..";

export async function getOrderById(productId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("product_id", productId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrder(order: Partial<Order>) {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: order.status,
      stock: order.stock,
    })
    .eq("product_id", order.productId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
