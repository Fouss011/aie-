const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function parseResponse(response, fallbackMessage) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
}

export async function importActivities(rows) {
  const response = await fetch(`${API_URL}/api/imports/activities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rows }),
  });

  return parseResponse(response, "Impossible d'importer les activités.");
}

export async function importCharges(rows) {
  const response = await fetch(`${API_URL}/api/imports/charges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rows }),
  });

  return parseResponse(response, "Impossible d'importer les charges.");
}