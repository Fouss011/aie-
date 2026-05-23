import {
  BarChart3,
  FileText,
  LogOut,
  NotebookText,
  ReceiptText,
  UploadCloud,
  WalletCards,
  X,
  UserRound,
  BriefcaseBusiness,
  PiggyBank,
  ListChecks,
} from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

const PAGE_META = {
  dashboard: "Vue d’ensemble",
  activities: "Recettes entrantes",
  charges: "Dépenses et sorties",
  imports: "Excel / CSV",
  documents: "Pièces jointes",
  notes: "Journal terrain",

  "personal-dashboard": "Vue d’ensemble",
  "personal-transactions": "Revenus et dépenses",
  "personal-budgets": "Limites mensuelles",
  "personal-savings": "Objectifs d’épargne",
};

const PAGE_ICONS = {
  dashboard: BarChart3,
  activities: WalletCards,
  charges: ReceiptText,
  imports: UploadCloud,
  documents: FileText,
  notes: NotebookText,

  "personal-dashboard": UserRound,
  "personal-transactions": ListChecks,
  "personal-budgets": PiggyBank,
  "personal-savings": PiggyBank,
};

export default function Sidebar({
  activePage,
  onNavigate,
  menuItems,
  mobileOpen = false,
  onClose,
  universe = "business",
  onSwitchUniverse,
}) {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      onClose?.();
    } catch (error) {
      console.error("Erreur déconnexion :", error);
    }
  }

  function handleUniverseChange(nextUniverse) {
    onSwitchUniverse?.(nextUniverse);
    onClose?.();
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[3px] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[296px] max-w-[86vw] transform p-3 transition-transform duration-300 lg:static lg:z-auto lg:block lg:w-[270px] lg:max-w-none lg:translate-x-0 lg:p-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="relative flex h-[calc(100dvh-24px)] flex-col overflow-hidden rounded-[32px] border border-white/45 bg-slate-950 text-white shadow-[0_26px_80px_rgba(15,23,42,0.26)] lg:sticky lg:top-4 lg:h-[calc(100vh-32px)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" />
            <div className="absolute -bottom-24 left-4 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%)]" />
          </div>

          <div className="relative flex items-center justify-between px-5 pb-2 pt-5 lg:hidden">
            <div className="inline-flex rounded-full border border-blue-300/30 bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">
              Monyva
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex-1 overflow-y-auto px-5 pb-5 pt-5">
            <div className="mb-5">
              <div className="hidden rounded-full border border-blue-300/30 bg-white/10 px-3 py-1 text-xs font-bold text-blue-100 lg:inline-flex">
                Monyva
              </div>

              <h2 className="mt-4 text-[26px] font-black leading-tight tracking-tight text-white">
                {universe === "business" ? "Pilotage simple" : "Budget personnel"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {universe === "business"
                  ? "Une interface légère pour suivre, comprendre et décider sans comptabilité lourde."
                  : "Un espace clair pour suivre tes revenus, tes dépenses et ton reste à vivre."}
              </p>
            </div>

            <div className="mb-5 rounded-[24px] border border-white/10 bg-white/[0.06] p-2">
              <button
                type="button"
                onClick={() => handleUniverseChange("business")}
                className={`mb-2 flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left text-sm font-black transition ${
                  universe === "business"
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <BriefcaseBusiness className="h-5 w-5" />
                Je gère mon activité
              </button>

              <button
                type="button"
                onClick={() => handleUniverseChange("personal")}
                className={`flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left text-sm font-black transition ${
                  universe === "personal"
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <UserRound className="h-5 w-5" />
                Je gère mon budget perso
              </button>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = activePage === item.key;
                const Icon = PAGE_ICONS[item.key] || BarChart3;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    className={`group w-full rounded-[22px] px-4 py-3 text-left transition duration-200 ${
                      isActive
                        ? "bg-white text-slate-950 shadow-[0_18px_44px_rgba(0,0,0,0.22)]"
                        : "border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.10]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                          isActive
                            ? "bg-slate-950 text-white"
                            : "bg-white/10 text-blue-100"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black">
                          {item.label}
                        </span>
                        <span
                          className={`mt-0.5 block truncate text-xs ${
                            isActive ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          {PAGE_META[item.key] || ""}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Positionnement
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-white">
                {universe === "business"
                  ? "Suivi intelligent des activités, pas un ERP lourd."
                  : "Comprendre où part l’argent et reprendre le contrôle."}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {universe === "business"
                  ? "Recettes, dépenses, résultat et conseils utiles."
                  : "Revenus, dépenses, budget, épargne et reste à vivre."}
              </p>
            </div>

            <div className="mt-5 pb-6">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-rose-500/15 hover:text-rose-100"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}