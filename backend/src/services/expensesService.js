import { supabase } from "../config/supabaseClient.js";

export async function createExpense(payload) {
  const expense = {
    label: payload.label,
    amount: Number(payload.amount),
    category: payload.category || null,
    expense_date: payload.expense_date,
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

export async function getRecentExpenses(limit = 100) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erreur lecture dépenses: ${error.message}`);
  }

  return data || [];
}

export async function getExpensesForPrompt(limit = 200) {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, label, amount, category, expense_date")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erreur lecture prompt dépenses: ${error.message}`);
  }

  return data || [];
}