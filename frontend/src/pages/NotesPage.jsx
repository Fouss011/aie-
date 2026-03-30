const mockNotes = [
  {
    id: 1,
    title: "Retard fournisseur",
    content: "Le fournisseur principal a décalé la livraison prévue ce matin.",
    priority: "Haute",
    date: "30/03/2026",
  },
  {
    id: 2,
    title: "Observation terrain",
    content: "Bonne affluence pendant la tranche de 10h à 12h.",
    priority: "Normale",
    date: "29/03/2026",
  },
];

export default function NotesPage() {
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

        <form className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Titre
            </label>
            <input
              type="text"
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
              placeholder="Décris ce qui s'est passé..."
              className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-2xl bg-[#0B1F3A] px-5 py-3 font-medium text-white transition hover:bg-[#102949]"
            >
              Enregistrer la note
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-slate-950">Historique</h3>
        </div>

        <div className="space-y-3">
          {mockNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{note.title}</p>
                <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600">
                  {note.priority}
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {note.content}
              </p>

              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                {note.date}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}