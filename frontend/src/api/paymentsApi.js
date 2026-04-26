const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function requestSubscriptionPayment(structureId) {
  const response = await fetch(`${API_URL}/api/payments/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ structureId }),
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Impossible de créer la demande d’abonnement.");
  }

  return data;
}