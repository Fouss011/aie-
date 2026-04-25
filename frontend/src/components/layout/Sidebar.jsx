import { useAuth } from "../../context/AuthProvider";

const PAGE_META = {
  dashboard: "Vue d’ensemble",
  activities: "Recettes entrantes",
  charges: "Dépenses et sorties",
  imports: "Excel / CSV",
  documents: "Pièces jointes",
  notes: "Journal terrain",
};

export default function Sidebar({
  activePage,
  onNavigate,
  menuItems,
  mobileOpen = false,
  onClose,
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

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[290px] max-w-[84vw] transform p-3 transition-transform duration-300 lg:static lg:z-auto lg:block lg:w-[260px] lg:max-w-none lg:translate-x-0 lg:p-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-[calc(100dvh-24px)] flex-col overflow-hidden rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(237,243,250,0.90))] shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:sticky lg:top-4 lg:h-auto">
          <div className="flex items-center justify-between px-5 pb-0 pt-5 lg:hidden">
            <div className="inline-flex rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
              Moniva
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Fermer
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-5">
            <div className="mb-6">
              <div className="hidden lg:inline-flex rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
                Moniva
              </div>

              <h2 className="mt-3 text-2xl font-bold text-slate-950">
                Pilotage simple
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Une interface claire pour suivre les recettes, dépenses,
                documents et notes terrain.
              </p>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = activePage === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                      isActive
                        ? "bg-[#0B1F3A] text-white shadow-[0_10px_24px_rgba(11,31,58,0.28)]"
                        : "border border-white/50 bg-white/55 text-slate-700 backdrop-blur-md hover:bg-white/80"
                    }`}
                  >
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div
                      className={`mt-1 text-xs ${
                        isActive ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {PAGE_META[item.key] || ""}
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Statut
              </p>
              <p className="mt-2 text-lg font-semibold text-emerald-600">
                Opérationnel
              </p>
            </div>

            <div className="mt-6 pb-6">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}