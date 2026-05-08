import { CalendarDays, CheckCircle2, Menu, Sparkles } from "lucide-react";
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
      return "Monyva";
  }
}

function getPageDescription(activePage, activeStructure) {
  switch (activePage) {
    case "dashboard":
      return activeStructure?.sector
        ? `Suivi intelligent de ${activeStructure.name}, secteur ${activeStructure.sector}.`
        : "Suivi simple des recettes, dépenses et décisions utiles.";
    case "activities":
      return "Enregistre ce qui entre et comprends ce qui fait avancer l’activité.";
    case "charges":
      return "Suis les sorties d’argent et repère les dépenses qui pèsent.";
    case "imports":
      return "Importe tes fichiers Excel ou CSV sans alourdir ta gestion.";
    case "documents":
      return "Centralise les justificatifs importants de la structure.";
    case "notes":
      return "Garde une trace claire du terrain, des idées et des observations.";
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
      <div className="h-[148px] sm:h-[158px] lg:hidden" />

      <div className="fixed left-0 right-0 top-0 z-40 px-3 pt-3 lg:sticky lg:top-0 lg:z-30 lg:px-0 lg:pt-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-[#EAF0F7]/95 backdrop-blur-sm lg:hidden" />

        <header className="relative overflow-hidden rounded-[28px] border border-white/55 bg-white/70 px-4 py-4 shadow-[0_18px_58px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:px-6 lg:px-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-300/25 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(239,246,255,0.48))]" />
          </div>

          <div className="relative mb-3 flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              onClick={onOpenMenu}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/85 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>

            <div className="inline-flex shrink-0 rounded-full border border-blue-300/50 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
              Monyva
            </div>
          </div>

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="hidden items-center gap-2 rounded-full border border-blue-300/45 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 lg:inline-flex">
                <Sparkles className="h-3.5 w-3.5" />
                Plateforme intelligente multi-secteurs
              </div>

              <h1 className="mt-1 break-words text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:mt-3 lg:text-[42px]">
                {getPageTitle(activePage, activeStructure)}
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
                {getPageDescription(activePage, activeStructure)}
              </p>
            </div>

            <div className="hidden shrink-0 gap-3 md:flex">
              <div className="rounded-[22px] border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md lg:min-w-[170px]">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.22em]">
                    Aujourd’hui
                  </p>
                </div>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {todayLabel}
                </p>
              </div>

              <div className="rounded-[22px] border border-emerald-200/80 bg-emerald-50/75 px-4 py-3 shadow-sm backdrop-blur-md lg:min-w-[150px]">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.22em]">
                    Statut
                  </p>
                </div>
                <p className="mt-2 text-sm font-black text-emerald-700">
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
