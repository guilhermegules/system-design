import { Order } from "@data/orders";
import { supabase } from "..";

export async function getOrderByProductId(productId: string) {
  const { data, error } = await supabase
    .from("inventory_orders")
    .select("*")
    .eq("product_id", productId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveOrder(order: Order) {
  const { data, error } = await supabase
    .from("inventory_orders")
    .update({
      quantity: order.quantity,
      status: order.status,
    })
    .eq("product_id", order.productId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAllOrders() {
  const { data, error } = await supabase.from("inventory_orders").select("*");

  if (error) {
    throw error;
  }

  return data;
}
