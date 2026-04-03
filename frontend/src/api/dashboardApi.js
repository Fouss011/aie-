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

export async function fetchDashboardKpis(structureId) {
  if (!structureId) {
    throw new Error("Structure active introuvable pour charger les KPI.");
  }

  const response = await fetch(buildUrl("/api/dashboard/kpis", { structureId }));

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Impossible de charger les KPI.");
  }

  return data;
}