import { useMemo, useState } from "react";
import { deleteExpense } from "../api/expensesApi";
import { useAuth } from "../context/AuthProvider";
import {
  groupItemsByMonth,
  formatMoney,
  formatDisplayDate,
} from "../utils/finance";

export default function ExpensesTable({ expenses = [], onDeleted, onEdit }) {
  const { activeStructure } = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const grouped = useMemo(
    () =>
      groupItemsByMonth(expenses, {
        dateFieldCandidates: ["date", "expense_date"],
        amountField: "amount",
      }),
    [expenses]
  );

  const [openMonthKey, setOpenMonthKey] = useState(grouped[0]?.key ?? null);

  async function handleDelete(item) {
    const label = item.label || "cette dépense";
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${label}" ?`
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setDeletingId(item.id);
      await deleteExpense(item.id, activeStructure?.id);
      onDeleted?.();
    } catch (err) {
      setActionError(err?.message || "Impossible de supprimer la dépense.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-[28px] border border-white/45 bg-[linear-gradient(180deg,rgba(248,250,252,0.90),rgba(241,245,249,0.84))] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-950">
          Dépenses enregistrées
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Dépenses rangées par mois avec détail à l’ouverture
        </p>
      </div>

      {actionError ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/35 p-8 text-center text-slate-500">
          Aucune dépense enregistrée.
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((month) => {
            const isOpen = openMonthKey === month.key;

            return (
              <div
                key={month.key}
                className="overflow-hidden rounded-2xl border border-white/60 bg-white/45 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenMonthKey(isOpen ? null : month.key)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/35"
                >
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-900">
                      {month.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {month.items.length} dépense(s)
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm text-slate-500">Total du mois</p>
                    <p className="mt-1 text-base font-bold text-rose-600">
                      {formatMoney(month.total)}
                    </p>
                  </div>
                </button>

                {isOpen ? (
                  <div className="overflow-x-auto border-t border-slate-200/60">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/70 bg-white/40 text-left">
                          <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                            Date
                          </th>
                          <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                            Libellé
                          </th>
                          <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                            Montant
                          </th>
                          <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                            Catégorie
                          </th>
                          <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {month.items.map((expense, index) => {
                          const isDeleting = deletingId === expense.id;

                          return (
                            <tr
                              key={expense.id ?? `${month.key}-${index}`}
                              className="border-b border-slate-200/40 transition hover:bg-white/35"
                            >
                              <td className="px-5 py-4 text-sm text-slate-600">
                                {formatDisplayDate(expense.date || expense.expense_date)}
                              </td>

                              <td className="px-5 py-4 text-base text-slate-900">
                                {expense.label || "-"}
                              </td>

                              <td className="px-5 py-4 text-base font-semibold text-rose-600">
                                {formatMoney(expense.amount)}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-500">
                                {expense.category || "-"}
                              </td>

                              <td className="px-5 py-4 text-sm">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onEdit?.(expense)}
                                    className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 transition hover:bg-blue-100"
                                  >
                                    Modifier
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(expense)}
                                    disabled={isDeleting}
                                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isDeleting ? "Suppression..." : "Supprimer"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}