const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchDashboardKpis() {
  const response = await fetch(`${API_URL}/api/dashboard/kpis`);

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