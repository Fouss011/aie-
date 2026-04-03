const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function buildUrl(path, params = {}) {
  const url = new URL(`${API_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export async function fetchSales(structureId) {
  if (!structureId) {
    throw new Error("Structure active introuvable pour charger les activités.");
  }

  const response = await fetch(buildUrl("/api/sales", { structureId }));

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

export async function createSale(payload, structureId) {
  if (!structureId) {
    throw new Error("Structure active introuvable pour ajouter une activité.");
  }

  const response = await fetch(`${API_URL}/api/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      structure_id: structureId,
    }),
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

export async function deleteSale(id, structureId) {
  if (!id) {
    throw new Error("Identifiant de l’activité introuvable.");
  }

  if (!structureId) {
    throw new Error("Structure active introuvable pour supprimer l’activité.");
  }

  const response = await fetch(
    buildUrl(`/api/sales/${id}`, { structureId }),
    {
      method: "DELETE",
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Impossible de supprimer l’activité.");
  }

  return data;
}