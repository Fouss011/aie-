import { useEffect, useState } from "react";
import { fetchSales } from "../api/salesApi";
import { fetchExpenses } from "../api/expensesApi";
import { fetchDashboardKpis } from "../api/dashboardApi";
import KpiGrid from "../components/KpiGrid";

export default function DashboardPage() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [salesData, expensesData, kpisData] = await Promise.all([
        fetchSales(),
        fetchExpenses(),
        fetchDashboardKpis(),
      ]);

      setSales(Array.isArray(salesData) ? salesData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setKpis(kpisData ?? {});
    } catch (err) {
      setError(err?.message || "Une erreur est survenue lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const recentSalesPreview = sales.slice(0, 4);
  const recentExpensesPreview = expenses.slice(0, 4);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/45 bg-[linear-gradient(180deg,rgba(248,250,252,0.90),rgba(241,245,249,0.84))] p-10 text-center text-slate-600 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200/80 bg-[linear-gradient(180deg,rgba(254,242,242,0.95),rgba(255,255,255,0.88))] p-5 text-red-700 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <KpiGrid kpis={kpis} />
        </div>

        <div className="rounded-[30px] border border-blue-100/70 bg-[linear-gradient(180deg,rgba(239,246,255,0.92),rgba(248,250,252,0.88))] p-5 shadow-[0_16px_40px_rgba(37,99,235,0.08)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-blue-700">
            Vue intelligente
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Résumé instantané
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-700">
            Une vue claire et immédiate de ton activité.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <p className="text-sm text-slate-500">Activité du jour</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {Number(kpis?.salesToday ?? 0).toLocaleString("fr-FR")} FCFA
              </p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <p className="text-sm text-slate-500">Charges du jour</p>
              <p className="mt-2 text-2xl font-bold text-rose-600">
                {Number(kpis?.expensesToday ?? 0).toLocaleString("fr-FR")} FCFA
              </p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <p className="text-sm text-slate-500">Lecture rapide</p>
              <p className="mt-2 text-base leading-7 text-slate-700">
                {Number(kpis?.salesToday ?? 0).toLocaleString("fr-FR")} FCFA
                d’activité pour{" "}
                {Number(kpis?.expensesToday ?? 0).toLocaleString("fr-FR")} FCFA
                de charges aujourd’hui.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Activités
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-950">
              Récentes
            </h3>
          </div>

          <div className="space-y-3">
            {recentSalesPreview.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/35 p-5 text-sm text-slate-500">
                Aucune activité enregistrée.
              </div>
            ) : (
              recentSalesPreview.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {item.product || item.label || item.activity || "-"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.date || "-"}
                    </p>
                  </div>

                  <p className="ml-4 shrink-0 font-semibold text-emerald-600">
                    {Number(item.amount ?? 0).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Charges
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-950">
              Récentes
            </h3>
          </div>

          <div className="space-y-3">
            {recentExpensesPreview.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/35 p-5 text-sm text-slate-500">
                Aucune charge enregistrée.
              </div>
            ) : (
              recentExpensesPreview.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {item.label || "-"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.date || "-"}
                    </p>
                  </div>

                  <p className="ml-4 shrink-0 font-semibold text-rose-600">
                    {Number(item.amount ?? 0).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}