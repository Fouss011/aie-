import { supabase } from "../config/supabaseClient.js";

export async function createSale(payload) {
  const sale = {
    product: payload.product,
    amount: Number(payload.amount),
    client_name: payload.client_name || null,
    sale_date: payload.sale_date,
  };

  const { data, error } = await supabase
    .from("sales")
    .insert([sale])
    .select()
    .single();

  if (error) {
    throw new Error(`Erreur création vente: ${error.message}`);
  }

  return data;
}

export async function getRecentSales(limit = 100) {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erreur lecture ventes: ${error.message}`);
  }

  return data || [];
}

export async function getSalesForPrompt(limit = 200) {
  const { data, error } = await supabase
    .from("sales")
    .select("id, product, amount, client_name, sale_date")
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erreur lecture prompt ventes: ${error.message}`);
  }

  return data || [];
}