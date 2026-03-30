const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function askAssistant(question) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Erreur assistant.");
  }

  return data;
}