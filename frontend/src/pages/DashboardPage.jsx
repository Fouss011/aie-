import { useEffect, useState } from "react";
import { fetchSales } from "../api/salesApi";
import { fetchExpenses } from "../api/expensesApi";
import { fetchDashboardKpis } from "../api/dashboardApi";
import KpiGrid from "../components/KpiGrid";
import { useAuth } from "../context/AuthProvider";

export default function DashboardPage() {
  const { activeStructure, logout } = useAuth();

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

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const recentSalesPreview = sales.slice(0, 4);
  const recentExpensesPreview = expenses.slice(0, 4);

  if (loading) {
    return (
      <div className="rounded-[24px] border border-white/45 bg-[linear-gradient(180deg,rgba(248,250,252,0.90),rgba(241,245,249,0.84))] p-8 text-center text-slate-600 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[28px] sm:p-10">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-red-200/80 bg-[linear-gradient(180deg,rgba(254,242,242,0.95),rgba(255,255,255,0.88))] p-5 text-red-700 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[28px]">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-[24px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[30px] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
              Structure active
            </p>

            <h2 className="mt-1 break-words text-2xl font-bold text-slate-950 sm:text-3xl">
              {activeStructure?.name || "Ma structure"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Espace principal de la structure connectée.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          >
            Déconnexion
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
              Nom
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {activeStructure?.name || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
              Secteur
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {activeStructure?.sector || "Non renseigné"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
              Localisation
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {[activeStructure?.city, activeStructure?.country]
                .filter(Boolean)
                .join(", ") || "Non renseignée"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">
              Identifiant
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-900">
              {activeStructure?.slug || "—"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="min-w-0 rounded-[24px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[30px] sm:p-5">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
              Vue d’ensemble
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
              Dashboard principal
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Les indicateurs clés de ton activité en un coup d’œil.
            </p>
          </div>

          <div className="overflow-hidden rounded-[22px]">
            <KpiGrid kpis={kpis} />
          </div>
        </div>

        <div className="rounded-[24px] border border-blue-100/70 bg-[linear-gradient(180deg,rgba(239,246,255,0.92),rgba(248,250,252,0.88))] p-4 shadow-[0_16px_40px_rgba(37,99,235,0.08)] backdrop-blur-xl sm:rounded-[30px] sm:p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-blue-700 sm:text-xs">
            Vue intelligente
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            Résumé instantané
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            Une vue claire et immédiate de ton activité.
          </p>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <p className="text-sm text-slate-500">Activité du jour</p>
              <p className="mt-2 text-xl font-bold text-emerald-600 sm:text-2xl">
                {Number(kpis?.salesToday ?? 0).toLocaleString("fr-FR")} FCFA
              </p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <p className="text-sm text-slate-500">Charges du jour</p>
              <p className="mt-2 text-xl font-bold text-rose-600 sm:text-2xl">
                {Number(kpis?.expensesToday ?? 0).toLocaleString("fr-FR")} FCFA
              </p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
              <p className="text-sm text-slate-500">Lecture rapide</p>
              <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">
                {Number(kpis?.salesToday ?? 0).toLocaleString("fr-FR")} FCFA
                d’activité pour{" "}
                {Number(kpis?.expensesToday ?? 0).toLocaleString("fr-FR")} FCFA
                de charges aujourd’hui.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[24px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[30px] sm:p-5">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
              Activités
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
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
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-slate-900">
                      {item.product || item.label || item.activity || "-"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.date || "-"}
                    </p>
                  </div>

                  <p className="shrink-0 text-right text-sm font-semibold text-emerald-600 sm:text-base">
                    {Number(item.amount ?? 0).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[30px] sm:p-5">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
              Charges
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
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
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-slate-900">
                      {item.label || "-"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.date || "-"}
                    </p>
                  </div>

                  <p className="shrink-0 text-right text-sm font-semibold text-rose-600 sm:text-base">
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