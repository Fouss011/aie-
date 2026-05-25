import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  PiggyBank,
  Wallet,
} from "lucide-react";

import {
  getPersonalDashboard,
  getPersonalBudgets,
  getPersonalTransactions,
} from "../api/personalApi";

const FIXED_CATEGORIES = ["Maison", "Dettes", "Abonnements"];

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function todayISO() {
  return localDateISO(new Date());
}

function normalizeDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function currentMonthISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getWeekRangeISO() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: localDateISO(monday),
    end: localDateISO(sunday),
  };
}

function monthLabel(monthKey) {
  if (!monthKey) return "";

  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function PersonalDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [todayKey, setTodayKey] = useState(todayISO());
  const [allTransactions, setAllTransactions] = useState([]);

  const [data, setData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    transactions: [],
  });

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    loadDashboard();
  }, [userId, todayKey]);

  useEffect(() => {
    if (!userId) return undefined;

    const now = new Date();
    const nextMidnight = new Date(now);

    nextMidnight.setHours(24, 0, 2, 0);

    const timeoutId = window.setTimeout(() => {
      setTodayKey(todayISO());
    }, Math.max(1000, nextMidnight.getTime() - now.getTime()));

    return () => window.clearTimeout(timeoutId);
  }, [userId, todayKey]);

  async function loadDashboard() {
    try {
      setLoading(true);

      if (!userId) {
        console.warn("Aucun userId trouvé");
        return;
      }

      const currentMonth = currentMonthISO();

      const [result, budgetData, transactionData] = await Promise.all([
        getPersonalDashboard(userId, currentMonth),
        getPersonalBudgets(userId, currentMonth),
        getPersonalTransactions(userId),
      ]);

      setData({
        income: result?.income || 0,
        expenses: result?.expenses || 0,
        balance: result?.balance || 0,
        transactions: result?.transactions || [],
      });

      setBudgets(budgetData || []);
      setAllTransactions(transactionData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const fixedExpenses = useMemo(() => {
    return data.transactions
      .filter((t) => FIXED_CATEGORIES.includes(t.category))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [data.transactions]);

  const budgetAlerts = useMemo(() => {
    const today = todayKey;
    const currentMonth = currentMonthISO();
    const week = getWeekRangeISO();

    return budgets
      .map((budget) => {
        const spent = data.transactions
          .filter((item) => {
            if (item.type !== "expense") return false;
            if (item.category !== budget.category) return false;

            const period = String(budget.period || "monthly")
              .toLowerCase()
              .trim();

            const itemDate = normalizeDate(item.transaction_date);

            if (period === "daily" || period === "jour" || period === "day") {
              return itemDate === today;
            }

            if (
              period === "weekly" ||
              period === "semaine" ||
              period === "week"
            ) {
              return itemDate >= week.start && itemDate <= week.end;
            }

            return itemDate.startsWith(currentMonth);
          })
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const planned = Number(budget.planned_amount || 0);
        const percent = planned > 0 ? (spent / planned) * 100 : 0;
        const threshold = Number(budget.alert_threshold || 80);

        return {
          ...budget,
          spent,
          planned,
          percent,
          isAlert: percent >= threshold,
        };
      })
      .filter((budget) => budget.isAlert);
  }, [budgets, data.transactions, todayKey]);

  const categoryStats = useMemo(() => {
    const grouped = {};

    data.transactions.forEach((item) => {
      if (item.type !== "expense") return;

      grouped[item.category] =
        (grouped[item.category] || 0) + Number(item.amount || 0);
    });

    const sorted = Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    const max = Math.max(...sorted.map((item) => item.amount), 1);

    return sorted.slice(0, 6).map((item) => ({
      ...item,
      percent: Math.round((item.amount / max) * 100),
    }));
  }, [data.transactions]);

  const monthlyHistory = useMemo(() => {
    const grouped = {};

    allTransactions.forEach((item) => {
      const monthKey = normalizeDate(item.transaction_date).slice(0, 7);

      if (!monthKey) return;

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
        };
      }

      if (item.type === "income") {
        grouped[monthKey].income += Number(item.amount || 0);
      }

      if (item.type === "expense") {
        grouped[monthKey].expenses += Number(item.amount || 0);
      }
    });

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        balance: item.income - item.expenses,
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);
  }, [allTransactions]);

  const spendingRate = data.income > 0 ? (data.expenses / data.income) * 100 : 0;
  const dayOfMonth = new Date().getDate();
  const dailyAverage =
    dayOfMonth > 0 ? Number(data.expenses || 0) / dayOfMonth : 0;

  const topCategory = categoryStats[0];

  const summaryText = useMemo(() => {
    if (data.transactions.length === 0) {
      return "Ajoute quelques opérations pour obtenir une analyse claire de ton mois.";
    }

    if (data.income <= 0 && data.expenses > 0) {
      return "Tu as déjà des dépenses, mais aucun revenu enregistré ce mois-ci. Ajoute tes revenus pour mieux calculer ton reste réel.";
    }

    if (spendingRate >= 90) {
      return "Attention, tes dépenses consomment presque tout ton revenu du mois. Priorité : ralentir les dépenses variables.";
    }

    if (spendingRate >= 70) {
      return "Ton budget reste correct, mais tu dois surveiller les petites dépenses répétées.";
    }

    return "Ta situation semble maîtrisée pour le moment. Continue à suivre tes catégories principales.";
  }, [data.transactions.length, data.income, data.expenses, spendingRate]);

  return (
    <div className="min-h-screen px-5 py-6 text-slate-950 lg:px-8">
      <div className="mb-6 rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
          Monyva Perso
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
          Vue personnelle
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Vue claire de ton argent : revenus, dépenses, reste à vivre, alertes,
          catégories et évolution mensuelle.
        </p>
      </div>

      {budgetAlerts.length > 0 && (
        <div className="mb-6 rounded-[28px] border border-rose-200 bg-rose-50/40 p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">
              Alerte budget
            </p>

            <p className="text-sm font-bold text-slate-700">
              {budgetAlerts.length} limite(s) ont atteint ou dépassé le seuil
              d’alerte.
            </p>
          </div>

          <div className="space-y-3">
            {budgetAlerts.map((budget) => {
              const exceeded = Math.max(0, budget.spent - budget.planned);
              const percent = Math.round(budget.percent);
              const period = String(budget.period || "monthly").toLowerCase();

              const periodLabel =
                period === "daily" || period === "jour" || period === "day"
                  ? "Jour"
                  : period === "weekly" ||
                    period === "semaine" ||
                    period === "week"
                  ? "Semaine"
                  : "Mois";

              return (
                <div
                  key={budget.id}
                  className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex min-w-[180px] items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-100">
                        <span className="h-3 w-3 rounded-full bg-rose-600" />
                      </div>

                      <div>
                        <p className="text-base font-black text-slate-950">
                          {budget.category}
                        </p>

                        <p className="text-[11px] font-black uppercase tracking-wide text-rose-600">
                          {periodLabel}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-[220px]">
                      <p className="text-sm font-black text-slate-900">
                        {formatMoney(budget.spent)} € dépensés /{" "}
                        {formatMoney(budget.planned)} € prévus
                      </p>

                      {exceeded > 0 && (
                        <p className="mt-1 text-sm font-black text-rose-600">
                          {formatMoney(exceeded)} € dépassés
                        </p>
                      )}
                    </div>

                    <div className="min-w-[260px] flex-1">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="text-xs font-black text-rose-600">
                          {percent} % utilisé
                        </p>

                        <p className="text-xs font-bold text-slate-500">
                          Alerte à {budget.alert_threshold || 80} %
                        </p>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-rose-100">
                        <div
                          className="h-full rounded-full bg-rose-600"
                          style={{
                            width: `${Math.min(100, percent)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="ml-auto rounded-2xl bg-rose-100 px-4 py-2 text-center">
                      <p className="text-base font-black text-rose-600 md:text-lg">
                        {percent} %
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-sm font-bold">Revenus du mois</span>
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-black text-emerald-950">
            {formatMoney(data.income)} €
          </p>
        </div>

        <div className="rounded-[28px] border border-rose-100 bg-rose-50 p-5">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-sm font-bold">Dépenses du mois</span>
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-black text-rose-950">
            {formatMoney(data.expenses)} €
          </p>
        </div>

        <div className="rounded-[28px] border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-sm font-bold">Reste à vivre</span>
            <Wallet className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-black text-blue-950">
            {formatMoney(data.balance)} €
          </p>
        </div>

        <div className="rounded-[28px] border border-amber-100 bg-amber-50 p-5">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-sm font-bold">Charges fixes</span>
            <PiggyBank className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-black text-amber-950">
            {formatMoney(fixedExpenses)} €
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Lecture rapide du mois
              </h2>
              <p className="text-sm text-slate-500">
                Synthèse simple de ta situation actuelle.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-bold leading-6 text-slate-700">
              {summaryText}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Taux dépensé
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {Math.round(spendingRate)} %
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Moyenne / jour
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {formatMoney(dailyAverage)} €
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Poste principal
                </p>
                <p className="mt-2 truncate text-2xl font-black text-slate-950">
                  {topCategory ? topCategory.category : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
              Dépenses par catégorie
            </h3>

            <div className="mt-4 space-y-4">
              {categoryStats.length === 0 && (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Aucune dépense catégorisée ce mois-ci.
                </p>
              )}

              {categoryStats.map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-black text-slate-800">
                      {item.category}
                    </p>
                    <p className="shrink-0 text-sm font-black text-slate-950">
                      {formatMoney(item.amount)} €
                    </p>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-950"
                      style={{
                        width: `${Math.max(8, item.percent)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Historique mensuel
              </h2>
              <p className="text-sm text-slate-500">
                Revenus, dépenses et solde par mois.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loading && (
              <p className="text-sm text-slate-500">Chargement...</p>
            )}

            {!loading && monthlyHistory.length === 0 && (
              <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                Aucun historique disponible.
              </p>
            )}

            {!loading &&
              monthlyHistory.map((month) => (
                <div
                  key={month.month}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black capitalize text-slate-950">
                      {monthLabel(month.month)}
                    </p>

                    <p
                      className={`rounded-2xl px-3 py-1 text-sm font-black ${
                        month.balance >= 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {formatMoney(month.balance)} €
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-bold text-slate-400">
                        Revenus
                      </p>
                      <p className="mt-1 font-black text-emerald-700">
                        {formatMoney(month.income)} €
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-bold text-slate-400">
                        Dépenses
                      </p>
                      <p className="mt-1 font-black text-rose-700">
                        {formatMoney(month.expenses)} €
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">
          Dernières transactions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Les dernières opérations saisies ce mois-ci.
        </p>

        <div className="mt-5 space-y-3">
          {loading && (
            <p className="text-sm text-slate-500">Chargement des données...</p>
          )}

          {!loading && data.transactions.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="font-black text-slate-950">
                Aucune transaction pour l’instant.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Ajoute tes opérations depuis le menu dédié.
              </p>
            </div>
          )}

          {!loading &&
            data.transactions.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {item.category} · {normalizeDate(item.transaction_date)}
                  </p>
                </div>

                <div
                  className={`shrink-0 rounded-2xl px-3 py-2 text-sm font-black ${
                    item.type === "income"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {item.type === "income" ? "+" : "-"}
                  {formatMoney(item.amount)} €
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}