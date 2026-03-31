const PAGE_META = {
  dashboard: "Vue d’ensemble",
  activities: "Suivi des opérations",
  charges: "Frais et sorties",
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
          fixed inset-y-0 left-0 z-50 w-[270px] max-w-[82vw] transform p-3 transition-transform duration-300 lg:static lg:z-auto lg:block lg:w-[235px] lg:max-w-none lg:translate-x-0 lg:p-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(237,243,250,0.90))] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:sticky lg:top-4 lg:h-auto">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <div className="inline-flex rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
              AIE PRO
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Fermer
            </button>
          </div>

          <div className="mb-6">
            <div className="hidden lg:inline-flex rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
              AIE PRO
            </div>

            <h2 className="mt-3 text-2xl font-bold text-slate-950">
              Pilotage simple
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Une interface claire pour suivre les activités, charges, documents
              et notes terrain.
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
        </div>
      </aside>
    </>
  );
}