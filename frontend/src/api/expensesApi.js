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

export async function fetchExpenses(structureId) {
  if (!structureId) {
    throw new Error("Structure active introuvable pour charger les dépenses.");
  }

  const response = await fetch(buildUrl("/api/expenses", { structureId }));

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

export async function createExpense(payload, structureId) {
  if (!structureId) {
    throw new Error("Structure active introuvable pour ajouter une dépense.");
  }

  const response = await fetch(`${API_URL}/api/expenses`, {
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
    throw new Error(data?.error || "Impossible d'ajouter la dépense.");
  }

  return data;
}

export async function updateExpense(id, payload, structureId) {
  if (!id) {
    throw new Error("Identifiant de la dépense introuvable.");
  }

  if (!structureId) {
    throw new Error("Structure active introuvable pour modifier la dépense.");
  }

  const response = await fetch(
    buildUrl(`/api/expenses/${id}`, { structureId }),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        structure_id: structureId,
      }),
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Impossible de modifier la dépense.");
  }

  return data;
}

export async function deleteExpense(id, structureId) {
  if (!id) {
    throw new Error("Identifiant de la dépense introuvable.");
  }

  if (!structureId) {
    throw new Error("Structure active introuvable pour supprimer la dépense.");
  }

  const response = await fetch(
    buildUrl(`/api/expenses/${id}`, { structureId }),
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
    throw new Error(data?.error || "Impossible de supprimer la dépense.");
  }

  return data;
}