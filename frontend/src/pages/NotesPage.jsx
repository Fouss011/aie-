import { useEffect, useMemo, useState } from "react";
import { createNote, deleteNote, getNotes } from "../services/notesService";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR");
}

export default function NotesPage({ activeStructure }) {
  const structureId = activeStructure?.id;

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("Normale");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return Boolean(structureId && title.trim() && content.trim());
  }, [structureId, title, content]);

  async function loadNotes() {
    if (!structureId) return;

    try {
      setLoading(true);
      const data = await getNotes(structureId);
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement notes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [structureId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSave) return;

    try {
      setSaving(true);

      const newNote = await createNote({
        structure_id: structureId,
        title: title.trim(),
        content: content.trim(),
        priority,
      });

      if (newNote?.id) {
        setNotes((current) => [newNote, ...current]);
      } else {
        await loadNotes();
      }

      setTitle("");
      setContent("");
      setPriority("Normale");
    } catch (error) {
      console.error("Erreur sauvegarde note:", error);
      alert("Impossible d'enregistrer la note pour le moment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Supprimer cette note ?");
    if (!confirmed) return;

    try {
      await deleteNote(id);
      setNotes((current) => current.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Erreur suppression note:", error);
      alert("Impossible de supprimer la note pour le moment.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-blue-700">
            Notes terrain
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Ajouter une note
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Garde une trace des incidents, remarques, contextes et observations
            utiles.
          </p>
        </div>

        {!structureId ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Sélectionne d’abord une structure pour enregistrer des notes.
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Titre
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex : Incident logistique"
                className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Note
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Décris ce qui s'est passé..."
                className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Priorité
              </label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option>Normale</option>
                <option>Haute</option>
                <option>Basse</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!canSave || saving}
                className="rounded-2xl bg-[#0B1F3A] px-5 py-3 font-medium text-white transition hover:bg-[#102949] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer la note"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-slate-950">Historique</h3>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement des notes...</p>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/45 p-5 text-sm text-slate-500">
            Aucune note enregistrée pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{note.title}</p>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600">
                      {note.priority}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {note.content}
                </p>

                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {formatDate(note.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}