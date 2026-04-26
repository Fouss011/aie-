const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

console.log("🔥 API_URL =", API_URL); // 👈 AJOUTE ÇA ICI

export async function requestSubscriptionPayment(structureId) {
  const response = await fetch(`${API_URL}/api/payments/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ structureId }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Impossible de créer la demande d’abonnement.");
  }

  if (!data?.paymentUrl) {
    throw new Error("Lien de paiement indisponible.");
  }

  return data;
}