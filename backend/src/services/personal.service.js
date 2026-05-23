import { supabase } from "../config/supabaseClient.js";

export async function getPersonalDashboard(userId) {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const startDate = `${year}-${month}-01`;

  const { data, error } = await supabase
    .from("personal_transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("transaction_date", startDate);

  if (error) {
    throw error;
  }

  const income = data
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = data
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  return {
    income,
    expenses,
    balance,
    transactions: data,
  };
}

export async function createPersonalTransaction(payload) {
  const { data, error } = await supabase
    .from("personal_transactions")
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getPersonalTransactions(userId) {
  const { data, error } = await supabase
    .from("personal_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePersonalTransaction(id) {
  const { error } = await supabase
    .from("personal_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

export async function getPersonalBudgets(userId, month) {
  const { data, error } = await supabase
    .from("personal_budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .order("category", { ascending: true });

  if (error) throw error;

  return data;
}

export async function createPersonalBudget(payload) {
  const { data, error } = await supabase
    .from("personal_budgets")
    .upsert([payload], {
      onConflict: "user_id,category,month",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deletePersonalBudget(id) {
  const { error } = await supabase
    .from("personal_budgets")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

export async function getPersonalRecurringExpenses(userId) {
  const { data, error } = await supabase
    .from("personal_recurring_expenses")
    .select("*")
    .eq("user_id", userId)
    .order("recurring_day", { ascending: true });

  if (error) throw error;

  return data;
}

export async function createPersonalRecurringExpense(payload) {
  const { data, error } = await supabase
    .from("personal_recurring_expenses")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deletePersonalRecurringExpense(id) {
  const { error } = await supabase
    .from("personal_recurring_expenses")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

export async function getPersonalSavingsGoals(userId) {
  const { data, error } = await supabase
    .from("personal_savings_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createPersonalSavingsGoal(payload) {
  const { data, error } = await supabase
    .from("personal_savings_goals")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updatePersonalSavingsGoal(id, payload) {
  const { data, error } = await supabase
    .from("personal_savings_goals")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deletePersonalSavingsGoal(id) {
  const { error } = await supabase
    .from("personal_savings_goals")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

export async function getPersonalCopilotContext(userId) {
  const [
    dashboard,
    transactions,
    budgets,
    recurringExpenses,
    savings,
  ] = await Promise.all([
    getPersonalDashboard(userId),
    getPersonalTransactions(userId),
    getPersonalBudgets(
      userId,
      new Date().toISOString().slice(0, 7)
    ),
    getPersonalRecurringExpenses(userId),
    getPersonalSavingsGoals(userId),
  ]);

  return {
    dashboard,
    transactions: transactions.slice(0, 50),
    budgets,
    recurringExpenses,
    savings,
  };
}