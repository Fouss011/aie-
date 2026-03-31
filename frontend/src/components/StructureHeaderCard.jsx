import { useAuth } from "../context/AuthProvider";

export default function StructureHeaderCard() {
  const { activeStructure, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  }

  return (
    <section className="mb-6 rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
            Structure active
          </div>

          <h2 className="mt-3 break-words text-2xl font-bold text-slate-950 sm:text-3xl">
            {activeStructure?.name || "Structure"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Espace sécurisé propre à la structure, avec données isolées.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        >
          Déconnexion
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/60 bg-white/65 p-4">
          <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
            Nom
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {activeStructure?.name || "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/65 p-4">
          <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
            Secteur
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {activeStructure?.sector || "Non renseigné"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/65 p-4">
          <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
            Localisation
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {[activeStructure?.city, activeStructure?.country]
              .filter(Boolean)
              .join(", ") || "Non renseignée"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/65 p-4">
          <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
            Identifiant
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-slate-900">
            {activeStructure?.slug || "—"}
          </p>
        </div>
      </div>
    </section>
  );
}