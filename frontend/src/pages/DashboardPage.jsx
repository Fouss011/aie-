import { useEffect, useMemo, useState } from "react";
import { fetchSales } from "../api/salesApi";
import { fetchExpenses } from "../api/expensesApi";
import { fetchDashboardKpis } from "../api/dashboardApi";
import KpiGrid from "../components/KpiGrid";
import MonthlyFinanceOverview from "../components/MonthlyFinanceOverview";
import { useAuth } from "../context/AuthProvider";
import InsightCard from "../components/InsightCard";
import { generateInsight } from "../utils/insightEngine";

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonthPrefix() {
  return getTodayString().slice(0, 7);
}

function normalizeDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { activeStructure, logout } = useAuth();

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const insight = useMemo(() => {
    const today = getTodayString();
    const currentMonth = getCurrentMonthPrefix();

    const salesToday = sales.reduce((total, item) => {
      const itemDate = normalizeDate(item.sale_date || item.date);
      return itemDate === today ? total + Number(item.amount || 0) : total;
    }, 0);

    const expensesToday = expenses.reduce((total, item) => {
      const itemDate = normalizeDate(item.expense_date || item.date);
      return itemDate === today ? total + Number(item.amount || 0) : total;
    }, 0);

    const monthSales = sales.reduce((total, item) => {
      const itemDate = normalizeDate(item.sale_date || item.date);
      return itemDate.startsWith(currentMonth)
        ? total + Number(item.amount || 0)
        : total;
    }, 0);

    const monthExpenses = expenses.reduce((total, item) => {
      const itemDate = normalizeDate(item.expense_date || item.date);
      return itemDate.startsWith(currentMonth)
        ? total + Number(item.amount || 0)
        : total;
    }, 0);

    return generateInsight({
      salesToday,
      expensesToday,
      monthSales,
      monthExpenses,
    });
  }, [sales, expenses]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const structureId = activeStructure?.id;

      if (!structureId) {
        throw new Error("Aucune structure active sélectionnée.");
      }

      const [salesData, expensesData, kpisData] = await Promise.all([
        fetchSales(structureId),
        fetchExpenses(structureId),
        fetchDashboardKpis(structureId),
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
    if (activeStructure?.id) {
      loadData();
    }
  }, [activeStructure?.id]);

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
                {" "}d’activité pour{" "}
                {Number(kpis?.expensesToday ?? 0).toLocaleString("fr-FR")} FCFA
                {" "}de charges aujourd’hui.
              </p>
            </div>

            <InsightCard insight={insight} />
          </div>
        </div>
      </section>

      <MonthlyFinanceOverview sales={sales} expenses={expenses} />

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
    </div>
  );
}