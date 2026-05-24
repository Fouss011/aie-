import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  PiggyBank,
  Plus,
  Wallet,
} from "lucide-react";

import {
  createPersonalTransaction,
  getPersonalDashboard,
  getPersonalBudgets,
} from "../api/personalApi";

const EXPENSE_CATEGORIES = [
  "Bouffe",
  "Maison",
  "Courses",
  "Transport",
  "Enfants",
  "Santé",
  "Dettes",
  "Abonnements",
  "Famille",
  "Loisirs",
  "Divers",
];

const INCOME_CATEGORIES = [
  "Salaire",
  "Ipsos",
  "Prime",
  "Tontine",
  "Projet",
  "Autre revenu",
];

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

export default function PersonalDashboardPage({ focusForm = false }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [todayKey, setTodayKey] = useState(todayISO());

  const [data, setData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    transactions: [],
  });

  const [form, setForm] = useState({
    type: "expense",
    label: "",
    amount: "",
    category: "Maison",
    transaction_date: todayISO(),
    note: "",
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

      setForm((current) => ({
        ...current,
        transaction_date:
          current.transaction_date === todayKey
            ? todayISO()
            : current.transaction_date,
      }));
    }, Math.max(1000, nextMidnight.getTime() - now.getTime()));

    return () => window.clearTimeout(timeoutId);
  }, [userId, todayKey]);

  const fixedExpenses = useMemo(() => {
    return data.transactions
      .filter((t) =>
        ["Maison", "Dettes", "Abonnements"].includes(t.category)
      )
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

  async function loadDashboard() {
    try {
      setLoading(true);

      if (!userId) {
        console.warn("Aucun userId trouvé");
        return;
      }

      const currentMonth = currentMonthISO();

      const result = await getPersonalDashboard(userId, currentMonth);

      const budgetData = await getPersonalBudgets(userId, currentMonth);

      setData({
        income: result?.income || 0,
        expenses: result?.expenses || 0,
        balance: result?.balance || 0,
        transactions: result?.transactions || [],
      });

      setBudgets(budgetData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type"
        ? {
            category: value === "income" ? "Salaire" : "Maison",
          }
        : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!userId) {
      alert("Utilisateur introuvable. Reconnecte-toi puis réessaie.");
      return;
    }

    if (!form.label.trim() || !form.amount) {
      alert("Ajoute un libellé et un montant.");
      return;
    }

    try {
      setSaving(true);

      await createPersonalTransaction({
        userId,
        type: form.type,
        label: form.label.trim(),
        amount: Number(form.amount),
        category: form.category,
        transaction_date: form.transaction_date || todayISO(),
        note: form.note?.trim() || null,
      });

      const freshToday = todayISO();

      setTodayKey(freshToday);

      setForm({
        type: "expense",
        label: "",
        amount: "",
        category: "Maison",
        transaction_date: freshToday,
        note: "",
      });

      await loadDashboard();
    } catch (error) {
      console.error(error);
      alert("Erreur pendant l’ajout.");
    } finally {
      setSaving(false);
    }
  }

  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="min-h-screen px-5 py-6 text-slate-950 lg:px-8">
      <div className="mb-8 rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
          Monyva Perso
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
          Gestion personnelle
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Suis tes revenus, tes dépenses, tes charges fixes et ton reste à vivre
          pour reprendre le contrôle de ton argent au quotidien.
        </p>
      </div>

      {budgetAlerts.length > 0 && (
  <div className="mb-6 rounded-[28px] border border-rose-200 bg-rose-50/40 p-4 shadow-sm">
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">
        Alerte budget
      </p>

      <p className="text-sm font-bold text-slate-700">
        {budgetAlerts.length} limite(s) ont atteint ou dépassé le seuil d’alerte.
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
            : period === "weekly" || period === "semaine" || period === "week"
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
                <p className="text-base md:text-lg font-black text-rose-600">
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className={`rounded-[32px] border bg-white p-6 shadow-sm ${
            focusForm
              ? "border-blue-400 ring-4 ring-blue-100"
              : "border-slate-200"
          }`}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Ajouter une opération
              </h2>

              <p className="text-sm text-slate-500">
                Revenu, dépense ou entrée ponctuelle.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => updateField("type", "expense")}
              className={`rounded-xl px-3 py-3 text-sm font-black ${
                form.type === "expense"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600"
              }`}
            >
              Dépense
            </button>

            <button
              type="button"
              onClick={() => updateField("type", "income")}
              className={`rounded-xl px-3 py-3 text-sm font-black ${
                form.type === "income"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600"
              }`}
            >
              Revenu
            </button>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-bold text-slate-700">Libellé</span>

            <input
              value={form.label}
              onChange={(e) => updateField("label", e.target.value)}
              placeholder={
                form.type === "income"
                  ? "Salaire Lidl, Ipsos, prime..."
                  : "Courses, loyer, transport..."
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Montant</span>

            <input
              value={form.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex : 150"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Catégorie</span>

            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950"
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Date</span>

            <div className="relative mt-2">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={form.transaction_date}
                onChange={(e) =>
                  updateField("transaction_date", e.target.value)
                }
                type="date"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm text-slate-950 outline-none focus:border-slate-950"
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Note optionnelle
            </span>

            <textarea
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              placeholder="Ex : dépense imprévue, remboursement, détail..."
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Ajout en cours..." : "Ajouter l’opération"}
          </button>
        </form>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">
            Dernières transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Les opérations saisies ce mois-ci.
          </p>

          <div className="mt-5 space-y-3">
            {loading && (
              <p className="text-sm text-slate-500">
                Chargement des données...
              </p>
            )}

            {!loading && data.transactions.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="font-black text-slate-950">
                  Aucune transaction pour l’instant.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Ajoute ton salaire, tes courses, ton loyer ou tes dépenses du
                  quotidien.
                </p>
              </div>
            )}

            {!loading &&
              data.transactions.slice(0, 12).map((item) => (
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
    </div>
  );
}