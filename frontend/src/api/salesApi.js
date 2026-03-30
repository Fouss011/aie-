const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchSales() {
  const response = await fetch(`${API_URL}/api/sales`);

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Impossible de charger les ventes.");
  }

  return data;
}

export async function createSale(payload) {
  const response = await fetch(`${API_URL}/api/sales`, {
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
    throw new Error(data?.error || "Impossible d'ajouter la vente.");
  }

  return data;
}