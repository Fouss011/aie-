import { useMemo, useState } from "react";
import { buildMonthlyFinanceRows, formatMoney, formatDisplayDate } from "../utils/finance";
import MonthlyFinanceChart from "./MonthlyFinanceChart";

export default function MonthlyFinanceOverview({ sales = [], expenses = [] }) {
  const rows = useMemo(() => buildMonthlyFinanceRows(sales, expenses), [sales, expenses]);
  const [selectedMonthKey, setSelectedMonthKey] = useState(rows[0]?.key ?? null);

  const selectedMonth = rows.find((row) => row.key === selectedMonthKey) || rows[0] || null;

  return (
    <section className="rounded-[24px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[30px] sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
            Finances mensuelles
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
            Chiffre d’affaire, charges et résultat
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Clique sur un mois pour voir le détail clair des recettes et des charges.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300/80 bg-white/35 p-6 text-sm text-slate-500">
          Aucune donnée disponible pour afficher les finances mensuelles.
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {rows.map((row) => {
              const isActive = row.key === selectedMonthKey;
              const resultColor = row.result >= 0 ? "text-emerald-600" : "text-rose-600";

              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => setSelectedMonthKey(row.key)}
                  className={`rounded-2xl border p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md transition ${
                    isActive
                      ? "border-blue-200 bg-blue-50/70"
                      : "border-white/60 bg-white/45 hover:bg-white/60"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{row.label}</p>

                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-slate-500">
                      Recettes :{" "}
                      <span className="font-semibold text-emerald-600">
                        {formatMoney(row.salesTotal)}
                      </span>
                    </p>

                    <p className="text-xs text-slate-500">
                      Charges :{" "}
                      <span className="font-semibold text-rose-600">
                        {formatMoney(row.expensesTotal)}
                      </span>
                    </p>

                    <p className={`text-sm font-bold ${resultColor}`}>
                      Résultat : {formatMoney(row.result)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <MonthlyFinanceChart rows={rows} />
          </div>

          {selectedMonth ? (
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <div className="rounded-[24px] border border-white/60 bg-white/50 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
                      Recettes du mois
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-950">
                      {selectedMonth.label}
                    </h3>
                  </div>

                  <p className="text-right text-sm font-bold text-emerald-600">
                    {formatMoney(selectedMonth.salesTotal)}
                  </p>
                </div>

                {selectedMonth.salesItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/35 p-4 text-sm text-slate-500">
                    Aucune recette pour ce mois.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedMonth.salesItems.map((item, index) => (
                      <div
                        key={item.id ?? `sale-${index}`}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-white/60 bg-white/55 p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-medium text-slate-900">
                            {item.product || item.label || item.activity || "-"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDisplayDate(item.date || item.sale_date)}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-emerald-600">
                          {formatMoney(item.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border border-white/60 bg-white/50 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
                      Charges du mois
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-950">
                      {selectedMonth.label}
                    </h3>
                  </div>

                  <p className="text-right text-sm font-bold text-rose-600">
                    {formatMoney(selectedMonth.expensesTotal)}
                  </p>
                </div>

                {selectedMonth.expenseItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/35 p-4 text-sm text-slate-500">
                    Aucune charge pour ce mois.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedMonth.expenseItems.map((item, index) => (
                      <div
                        key={item.id ?? `expense-${index}`}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-white/60 bg-white/55 p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-medium text-slate-900">
                            {item.label || "-"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDisplayDate(item.date || item.expense_date)}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-rose-600">
                          {formatMoney(item.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}