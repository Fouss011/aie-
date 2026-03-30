export default function ExpensesTable({ expenses = [] }) {
  return (
    <section className="rounded-[28px] border border-white/45 bg-[linear-gradient(180deg,rgba(248,250,252,0.90),rgba(241,245,249,0.84))] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-950">
          Charges enregistrées
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Dernières charges ajoutées dans le système
        </p>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/35 p-8 text-center text-slate-500">
          Aucune charge enregistrée.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/45 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
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
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense, index) => (
                <tr
                  key={expense.id ?? index}
                  className="border-b border-slate-200/40 transition hover:bg-white/35"
                >
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {expense.date || expense.expense_date || "-"}
                  </td>

                  <td className="px-5 py-4 text-base text-slate-900">
                    {expense.label || "-"}
                  </td>

                  <td className="px-5 py-4 text-base font-semibold text-rose-600">
                    {Number(expense.amount ?? 0).toLocaleString("fr-FR")} FCFA
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {expense.category || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}