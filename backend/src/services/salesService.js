import { supabase } from "../config/supabaseClient.js";

export async function createSale(payload) {
  const sale = {
    product: payload.product,
    amount: Number(payload.amount),
    client_name: payload.client_name || null,
    sale_date: payload.sale_date,
    structure_id: payload.structure_id,
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

export async function getRecentSales(structureId, limit = 100) {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("structure_id", structureId)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erreur lecture ventes: ${error.message}`);
  }

  return data || [];
}

export async function getSalesForPrompt(structureId, limit = 200) {
  const { data, error } = await supabase
    .from("sales")
    .select("id, product, amount, client_name, sale_date, structure_id")
    .eq("structure_id", structureId)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erreur lecture prompt ventes: ${error.message}`);
  }

  return data || [];
}

export async function deleteSale(id, structureId) {
  const { data, error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id)
    .eq("structure_id", structureId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Erreur suppression vente: ${error.message}`);
  }

  return data;
}