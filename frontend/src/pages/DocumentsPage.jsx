// frontend/src/pages/DocumentsPage.jsx

import { useEffect, useState } from "react";
import {
  deleteDocument,
  fetchDocuments,
  uploadDocument,
} from "../api/documentsApi";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [linkedKind, setLinkedKind] = useState("charge");
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function loadDocuments() {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs || []);
    } catch (err) {
      setError(err.message || "Impossible de charger les documents.");
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      await uploadDocument({
        file,
        label,
        linkedKind,
      });

      setSuccess("Document ajouté avec succès.");
      setLabel("");
      event.target.value = "";

      await loadDocuments();
    } catch (err) {
      setError(err.message || "Impossible d'envoyer le document.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      setError(err.message || "Impossible de supprimer le document.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Ajouter un justificatif
          </h1>
          <p className="mt-2 text-slate-500">
            Ajoute une facture, une photo ou un PDF et indique simplement à quoi
            il correspond.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Ce document concerne :
            </label>

            <select
              value={linkedKind}
              onChange={(e) => setLinkedKind(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="charge">Une charge</option>
              <option value="activity">Une activité</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Titre (facultatif)
            </label>

            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex : Facture internet mars"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center">
          <p className="font-medium text-slate-700">
            Sélectionne ton fichier
          </p>

          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleUpload}
            className="mt-4 block w-full rounded-2xl border border-slate-200 px-4 py-3 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white"
          />

          {uploading && (
            <p className="mt-4 text-sm text-slate-500">
              Envoi du document...
            </p>
          )}
        </div>

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Justificatifs récents
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Aucun document ajouté pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {doc.label || doc.fileName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {doc.linkedKind === "charge"
                      ? "Charge"
                      : doc.linkedKind === "activity"
                      ? "Activité"
                      : "Autre"}
                  </p>

                  {doc.publicUrl && (
                    <a
                      href={doc.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-blue-700 hover:underline"
                    >
                      Ouvrir le document
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}