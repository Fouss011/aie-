const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchExpenses() {
  const response = await fetch(`${API_URL}/api/expenses`);

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Impossible de charger les dépenses.");
  }

  return data;
}

export async function createExpense(payload) {
  const response = await fetch(`${API_URL}/api/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Impossible d'ajouter la dépense.");
  }

  return data;
}