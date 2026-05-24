const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function getPersonalDashboard(userId, month) {
  const params = new URLSearchParams({ userId });

  if (month) {
    params.set("month", month);
  }

  const response = await fetch(
    `${API_URL}/api/personal/dashboard?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Erreur dashboard perso");
  }

  return response.json();
}

export async function getPersonalTransactions(userId) {
  const response = await fetch(
    `${API_URL}/api/personal/transactions?userId=${userId}`
  );

  if (!response.ok) {
    throw new Error("Erreur transactions perso");
  }

  return response.json();
}

export async function createPersonalTransaction(payload) {
  const response = await fetch(`${API_URL}/api/personal/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erreur création transaction");
  }

  return response.json();
}

export async function deletePersonalTransaction(id) {
  const response = await fetch(`${API_URL}/api/personal/transactions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erreur suppression");
  }

  return response.json();
}

export async function getPersonalBudgets(userId, month) {
  const response = await fetch(
    `${API_URL}/api/personal/budgets?userId=${userId}&month=${month}`
  );

  if (!response.ok) {
    throw new Error("Erreur récupération budgets");
  }

  return response.json();
}

export async function createPersonalBudget(payload) {
  const response = await fetch(`${API_URL}/api/personal/budgets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erreur création budget");
  }

  return response.json();
}

export async function deletePersonalBudget(id) {
  const response = await fetch(`${API_URL}/api/personal/budgets/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erreur suppression budget");
  }

  return response.json();
}

export async function getPersonalSavings(userId) {
  const response = await fetch(
    `${API_URL}/api/personal/savings?userId=${userId}`
  );

  if (!response.ok) {
    throw new Error("Erreur récupération objectifs");
  }

  return response.json();
}

export async function createPersonalSaving(payload) {
  const response = await fetch(`${API_URL}/api/personal/savings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erreur création objectif");
  }

  return response.json();
}

export async function updatePersonalSaving(id, payload) {
  const response = await fetch(`${API_URL}/api/personal/savings/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erreur mise à jour objectif");
  }

  return response.json();
}

export async function deletePersonalSaving(id) {
  const response = await fetch(`${API_URL}/api/personal/savings/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erreur suppression objectif");
  }

  return response.json();
}