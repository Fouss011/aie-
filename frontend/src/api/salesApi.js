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
    throw new Error("Structure active introuvable pour charger les recettes.");
  }

  const response = await fetch(buildUrl("/api/sales", { structureId }));

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Impossible de charger les recettes.");
  }

  return data;
}

export async function createSale(payload, structureId) {
  if (!structureId) {
    throw new Error("Structure active introuvable pour ajouter une recette.");
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
    throw new Error(data?.error || "Impossible d'ajouter la recette.");
  }

  return data;
}

export async function updateSale(id, payload, structureId) {
  if (!id) {
    throw new Error("Identifiant de la recette introuvable.");
  }

  if (!structureId) {
    throw new Error("Structure active introuvable pour modifier la recette.");
  }

  const response = await fetch(buildUrl(`/api/sales/${id}`, { structureId }), {
    method: "PUT",
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
    throw new Error(data?.error || "Impossible de modifier la recette.");
  }

  return data;
}

export async function deleteSale(id, structureId) {
  if (!id) {
    throw new Error("Identifiant de la recette introuvable.");
  }

  if (!structureId) {
    throw new Error("Structure active introuvable pour supprimer la recette.");
  }

  const response = await fetch(buildUrl(`/api/sales/${id}`, { structureId }), {
    method: "DELETE",
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Impossible de supprimer la recette.");
  }

  return data;
}