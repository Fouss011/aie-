import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { fetchSales } from "../api/salesApi";
import { fetchExpenses } from "../api/expensesApi";
import { fetchDashboardKpis } from "../api/dashboardApi";
import KpiGrid from "../components/KpiGrid";
import MonthlyFinanceOverview from "../components/MonthlyFinanceOverview";
import { useAuth } from "../context/AuthProvider";
import InsightCard from "../components/InsightCard";
import { generateInsight } from "../utils/insightEngine";
import PremiumLockCard from "../components/PremiumLockCard";
import { getTrialStatus } from "../utils/access";
import SubscriptionBanner from "../components/SubscriptionBanner";
import { formatMoney } from "../utils/finance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

function buildLocalKpis(sales = [], expenses = []) {
  const today = getTodayString();
  const currentMonth = getCurrentMonthPrefix();

  let salesToday = 0;
  let expensesToday = 0;
  let salesMonth = 0;
  let expensesMonth = 0;

  const productCount = new Map();

  sales.forEach((item) => {
    const amount = Number(item.amount || 0);
    const itemDate = normalizeDate(item.sale_date || item.date);

    if (itemDate === today) salesToday += amount;
    if (itemDate.startsWith(currentMonth)) salesMonth += amount;

    const product = item.product || "Aucune donnée";
    productCount.set(product, (productCount.get(product) || 0) + 1);
  });

  expenses.forEach((item) => {
    const amount = Number(item.amount || 0);
    const itemDate = normalizeDate(item.expense_date || item.date);

    if (itemDate === today) expensesToday += amount;
    if (itemDate.startsWith(currentMonth)) expensesMonth += amount;
  });

  let topProduct = "Aucune donnée";
  let bestCount = 0;

  productCount.forEach((count, product) => {
    if (count > bestCount) {
      bestCount = count;
      topProduct = product;
    }
  });

  return {
    salesToday,
    expensesToday,
    profitToday: salesToday - expensesToday,
    salesMonth,
    expensesMonth,
    profitMonth: salesMonth - expensesMonth,
    salesCount: sales.length,
    expensesCount: expenses.length,
    topProduct,
  };
}

function getBusinessStatus(kpis) {
  const profitMonth = Number(kpis?.profitMonth || 0);
  const salesMonth = Number(kpis?.salesMonth || 0);
  const expensesMonth = Number(kpis?.expensesMonth || 0);

  if (!salesMonth && !expensesMonth) {
    return {
      label: "Démarrage",
      title: "Ajoute tes premières recettes et dépenses.",
      message:
        "Monyva pourra ensuite lire ton activité et te donner des décisions simples.",
      tone: "text-slate-700",
      badge: "bg-slate-900 text-white",
      icon: Target,
    };
  }

  if (profitMonth > 0) {
    return {
      label: "Rentable",
      title: "Votre activité est positive ce mois-ci.",
      message:
        "Continuez à suivre vos entrées et sorties pour garder une vision claire.",
      tone: "text-emerald-700",
      badge: "bg-emerald-600 text-white",
      icon: TrendingUp,
    };
  }

  if (profitMonth < 0) {
    return {
      label: "À surveiller",
      title: "Vos dépenses dépassent vos recettes ce mois-ci.",
      message:
        "Identifiez les charges les plus lourdes avant qu’elles ne deviennent un problème.",
      tone: "text-rose-700",
      badge: "bg-rose-600 text-white",
      icon: TrendingDown,
    };
  }

  return {
    label: "Équilibre",
    title: "Votre activité est à l’équilibre ce mois-ci.",
    message: "Un petit effort sur les recettes peut faire basculer le mois en positif.",
    tone: "text-blue-700",
    badge: "bg-blue-600 text-white",
    icon: CheckCircle2,
  };
}

export default function DashboardPage() {
  const { activeStructure, logout } = useAuth();

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const trialStatus = getTrialStatus(activeStructure);
  const canUsePremium = access?.isActive ?? trialStatus.isTrialActive;

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

  const businessStatus = useMemo(() => getBusinessStatus(kpis), [kpis]);
  const StatusIcon = businessStatus.icon;

  async function loadAccessStatus(structureId) {
    try {
      const response = await fetch(
        `${API_URL}/api/access/status?structureId=${structureId}`
      );

      if (!response.ok) return;

      const data = await response.json();
      setAccess(data);
    } catch (err) {
      console.warn("Statut accès indisponible :", err);
    }
  }

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

      await loadAccessStatus(structureId);

      const safeSales = Array.isArray(salesData) ? salesData : [];
      const safeExpenses = Array.isArray(expensesData) ? expensesData : [];

      setSales(safeSales);
      setExpenses(safeExpenses);

      const localKpis = buildLocalKpis(safeSales, safeExpenses);

      setKpis({
        ...localKpis,
        ...(kpisData || {}),
        salesToday: localKpis.salesToday,
        expensesToday: localKpis.expensesToday,
      });
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
      <div className="grid min-h-[55vh] place-items-center rounded-[32px] border border-white/60 bg-white/45 p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div>
          <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-slate-950" />
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Chargement de votre activité...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {access && <SubscriptionBanner access={access} />}

      <section className="relative overflow-hidden rounded-[30px] border border-white/60 bg-slate-950 p-5 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%)]" />
        </div>

        <div className="relative grid gap-6 xl:grid-cols-[1.45fr_0.85fr] xl:items-stretch">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${businessStatus.badge}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {businessStatus.label}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Pilotage intelligent
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Suivez votre argent et prenez de meilleures décisions chaque jour.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {businessStatus.title} {businessStatus.message}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Résultat mois
                </p>
                <p className={`mt-2 break-words text-2xl font-black ${Number(kpis?.profitMonth || 0) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatMoney(kpis?.profitMonth)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Recettes mois
                </p>
                <p className="mt-2 break-words text-2xl font-black text-white">
                  {formatMoney(kpis?.salesMonth)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Dépenses mois
                </p>
                <p className="mt-2 break-words text-2xl font-black text-white">
                  {formatMoney(kpis?.expensesMonth)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col justify-between rounded-[26px] border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">
                Conseil Monyva
              </p>
              <p className="mt-3 text-xl font-black leading-tight text-white">
                {insight?.message || "Ajoutez vos données pour obtenir une analyse."}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Le but n’est pas de faire une comptabilité lourde : c’est de comprendre rapidement ce qui avance, ce qui coûte et quoi corriger.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs text-slate-400">Question utile à poser au copilote</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                  Pourquoi mon résultat baisse ? <ArrowRight className="h-4 w-4" />
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs text-slate-400">Décision rapide</p>
                <p className="mt-1 text-sm font-bold text-white">
                  Regarder les dépenses avant d’ajouter de nouvelles charges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <KpiGrid kpis={kpis} />

      {canUsePremium ? (
        <InsightCard insight={insight} kpis={kpis} />
      ) : (
        <PremiumLockCard
          title="Analyse intelligente réservée"
          message="Active ton abonnement pour débloquer les conseils avancés de Monyva."
        />
      )}

      <MonthlyFinanceOverview sales={sales} expenses={expenses} />

      <section className="rounded-[28px] border border-white/50 bg-white/55 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
              Structure active
            </p>
            <h2 className="mt-2 break-words text-2xl font-black text-slate-950 sm:text-3xl">
              {activeStructure?.name || "Ma structure"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Votre espace reste simple : recettes, dépenses, résultat, historique et décisions utiles.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Déconnexion
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm">
            <Building2 className="h-5 w-5 text-slate-500" />
            <p className="mt-3 text-[11px] uppercase tracking-[0.20em] text-slate-500">Secteur</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{activeStructure?.sector || "Non renseigné"}</p>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm">
            <MapPin className="h-5 w-5 text-slate-500" />
            <p className="mt-3 text-[11px] uppercase tracking-[0.20em] text-slate-500">Localisation</p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {[activeStructure?.city, activeStructure?.country].filter(Boolean).join(", ") || "Non renseignée"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm sm:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.20em] text-slate-500">Identifiant</p>
            <p className="mt-2 break-all text-sm font-bold text-slate-900">{activeStructure?.slug || "—"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
