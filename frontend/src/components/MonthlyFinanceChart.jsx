import { formatMoney } from "../utils/finance";

export default function MonthlyFinanceChart({ rows = [] }) {
  const maxValue =
    Math.max(
      ...rows.flatMap((row) => [
        Number(row.salesTotal || 0),
        Number(row.expensesTotal || 0),
      ]),
      1
    ) || 1;

  return (
    <div className="rounded-[24px] border border-white/60 bg-white/50 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
          Évolution mensuelle
        </p>
        <h3 className="mt-1 text-xl font-bold text-slate-950">
          Diagramme à barres
        </h3>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/35 p-5 text-sm text-slate-500">
          Pas assez de données pour le graphique.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const salesWidth = `${Math.max((Number(row.salesTotal || 0) / maxValue) * 100, 2)}%`;
            const expensesWidth = `${Math.max((Number(row.expensesTotal || 0) / maxValue) * 100, 2)}%`;

            return (
              <div key={row.key} className="rounded-2xl border border-white/60 bg-white/45 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{row.label}</p>
                  <p className={`text-sm font-bold ${row.result >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    Résultat : {formatMoney(row.result)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>Recettes</span>
                      <span>{formatMoney(row.salesTotal)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500/80"
                        style={{ width: salesWidth }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>Charges</span>
                      <span>{formatMoney(row.expensesTotal)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500/80"
                        style={{ width: expensesWidth }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}