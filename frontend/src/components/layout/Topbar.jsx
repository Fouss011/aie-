function getPageTitle(activePage) {
  switch (activePage) {
    case "dashboard":
      return "Dashboard";
    case "activities":
      return "Activités";
    case "charges":
      return "Charges";
    case "imports":
      return "Imports";
    case "documents":
      return "Justificatifs";
    case "notes":
      return "Notes terrain";
    default:
      return "AIE PRO";
  }
}

function getPageDescription(activePage) {
  switch (activePage) {
    case "dashboard":
      return "Vue rapide de la situation actuelle.";
    case "activities":
      return "Enregistre et consulte les activités de la structure.";
    case "charges":
      return "Suis les charges, frais et coûts opérationnels.";
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

export default function Topbar({ activePage }) {
  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="rounded-[32px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(237,243,250,0.86))] px-5 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
            AIE PRO • Plateforme intelligente multi-secteurs
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            {getPageTitle(activePage)}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
            {getPageDescription(activePage)}
          </p>
        </div>

        <div className="grid gap-3 self-start sm:grid-cols-2 lg:grid-cols-1">
          <div className="flex min-w-[190px] flex-col justify-center rounded-2xl border border-white/60 bg-white/55 px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
              Aujourd’hui
            </p>
            <p className="mt-2 text-lg font-semibold leading-6 text-slate-900">
              {todayLabel}
            </p>
          </div>

          <div className="flex min-w-[190px] flex-col justify-center rounded-2xl border border-white/60 bg-white/55 px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
              Statut
            </p>
            <p className="mt-2 text-lg font-semibold leading-6 text-emerald-600">
              Opérationnel
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}