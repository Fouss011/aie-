import { useAuth } from "../../context/AuthProvider";

function getPageTitle(activePage, activeStructure) {
  switch (activePage) {
    case "dashboard":
      return activeStructure?.name || "Ma structure";
    case "activities":
      return "Recettes";
    case "charges":
      return "Dépenses";
    case "imports":
      return "Imports";
    case "documents":
      return "Justificatifs";
    case "notes":
      return "Notes terrain";
    default:
      return "Moniva";
  }
}

function getPageDescription(activePage, activeStructure) {
  switch (activePage) {
    case "dashboard":
      return activeStructure?.sector
        ? `Espace principal de ${activeStructure.name}, structure du secteur ${activeStructure.sector}.`
        : "Vue rapide de la situation actuelle de la structure.";
    case "activities":
      return "Enregistre et consulte les recettes de la structure.";
    case "charges":
      return "Suis les dépenses, frais et coûts opérationnels.";
    case "imports":
      return "Importe des données Excel ou CSV proprement.";
    case "documents":
      return "Centralise les pièces et justificatifs utiles.";
    case "notes":
      return "Garde une trace du contexte et des observations terrain.";
    default:
      return "";
  }
}

export default function Topbar({ activePage, onOpenMenu }) {
  const { activeStructure } = useAuth();

  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="h-[210px] sm:h-[220px] lg:hidden" />

      <div className="fixed left-0 right-0 top-0 z-40 px-3 pt-3 lg:sticky lg:top-0 lg:z-30 lg:px-0 lg:pt-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-[#E7EDF5]/95 backdrop-blur-sm lg:hidden" />

        <header className="relative rounded-[24px] border border-white/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(237,243,250,0.93))] px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:px-6 sm:py-5 lg:rounded-[28px] lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              onClick={onOpenMenu}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
            >
              <span className="text-lg leading-none">☰</span>
              Menu
            </button>

            <div className="inline-flex shrink-0 rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-[11px] font-semibold text-blue-800">
              Moniva
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="hidden lg:inline-flex items-center gap-2 rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
                Moniva • Plateforme intelligente multi-secteurs
              </div>

              <h1 className="mt-1 break-words text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:mt-4 lg:text-5xl">
                {getPageTitle(activePage, activeStructure)}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
                {getPageDescription(activePage, activeStructure)}
              </p>
            </div>

            <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-white/60 bg-white/55 px-4 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-md sm:min-w-[190px] sm:px-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  Aujourd’hui
                </p>
                <p className="mt-2 text-base font-semibold leading-6 text-slate-900 sm:text-lg">
                  {todayLabel}
                </p>
              </div>

              <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-white/60 bg-white/55 px-4 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-md sm:min-w-[190px] sm:px-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  Statut
                </p>
                <p className="mt-2 text-base font-semibold leading-6 text-emerald-600 sm:text-lg">
                  Opérationnel
                </p>
              </div>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}