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

export async function fetchDocuments() {
  const response = await fetch(`${API_URL}/api/documents`);
  return parseResponse(response, "Impossible de charger les documents.");
}

export async function uploadDocument({ file, label, linkedTo, linkedKind }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label || "");
  formData.append("linkedTo", linkedTo || "");
  formData.append("linkedKind", linkedKind || "");

  const response = await fetch(`${API_URL}/api/documents`, {
    method: "POST",
    body: formData,
  });

  return parseResponse(response, "Impossible d'envoyer le document.");
}

export async function deleteDocument(id) {
  const response = await fetch(`${API_URL}/api/documents/${id}`, {
    method: "DELETE",
  });

  return parseResponse(response, "Impossible de supprimer le document.");
}