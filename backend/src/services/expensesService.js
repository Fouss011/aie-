import { supabase } from "../config/supabaseClient.js";

export async function createExpense(payload) {
  const expense = {
    label: payload.label,
    amount: Number(payload.amount),
    category: payload.category || null,
    expense_date: payload.expense_date,
    structure_id: payload.structure_id,
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert([expense])
    .select()
    .single();

  if (error) {
    throw new Error(`Erreur création dépense: ${error.message}`);
  }

  return data;
}

export async function updateExpense(id, payload) {
  const updates = {
    label: payload.label,
    amount: Number(payload.amount),
    category: payload.category || null,
    expense_date: payload.expense_date,
  };

  const { data, error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", id)
    .eq("structure_id", payload.structure_id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Erreur modification dépense: ${error.message}`);
  }

  return data;
}

export async function getRecentExpenses(structureId, limit = 100) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("structure_id", structureId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erreur lecture dépenses: ${error.message}`);
  }

  return data || [];
}

export async function getExpensesForPrompt(structureId, limit = 200) {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, label, amount, category, expense_date, structure_id")
    .eq("structure_id", structureId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erreur lecture prompt dépenses: ${error.message}`);
  }

  return data || [];
}

export async function deleteExpense(id, structureId) {
  const { data, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("structure_id", structureId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Erreur suppression dépense: ${error.message}`);
  }

  return data;
}