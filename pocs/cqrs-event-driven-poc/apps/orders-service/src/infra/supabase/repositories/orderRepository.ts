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
