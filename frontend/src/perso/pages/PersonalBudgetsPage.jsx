import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, PiggyBank, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

import {
  createPersonalBudget,
  deletePersonalBudget,
  getPersonalBudgets,
  getPersonalTransactions,
} from "../api/personalApi";

const CATEGORIES = [
  "Maison",
  "Bouffe",
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

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
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
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function periodLabel(period) {
  if (period === "daily") return "Jour";
  if (period === "weekly") return "Semaine";
  return "Mois";
}

function periodDescription(period) {
  if (period === "daily") return "limite quotidienne";
  if (period === "weekly") return "limite hebdomadaire";
  return "limite mensuelle";
}

export default function PersonalBudgetsPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [month, setMonth] = useState(currentMonth());
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    category: "Bouffe",
    planned_amount: "",
    alert_threshold: 80,
    period: "daily",
  });

  useEffect(() => {
    loadData();
  }, [userId, month]);

  async function loadData() {
    if (!userId) return;

    const [budgetData, transactionData] = await Promise.all([
      getPersonalBudgets(userId, month),
      getPersonalTransactions(userId),
    ]);

    setBudgets(budgetData);
    setTransactions(transactionData);
  }

  function getSpentForBudget(budget) {
    const today = todayISO();
    const week = getWeekRangeISO();

    return transactions
      .filter((item) => {
        if (item.type !== "expense") return false;
        if (item.category !== budget.category) return false;

        const date = item.transaction_date;

        if (budget.period === "daily") {
          return date === today;
        }

        if (budget.period === "weekly") {
          return date >= week.start && date <= week.end;
        }

        return date?.startsWith(month);
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!userId) {
      alert("Utilisateur introuvable. Reconnecte-toi puis réessaie.");
      return;
    }

    if (!form.planned_amount) {
      alert("Ajoute un montant prévu.");
      return;
    }

    try {
      setSaving(true);

      await createPersonalBudget({
        userId,
        category: form.category,
        month,
        planned_amount: Number(form.planned_amount),
        alert_threshold: Number(form.alert_threshold),
        period: form.period,
      });

      setForm({
        category: "Bouffe",
        planned_amount: "",
        alert_threshold: 80,
        period: "daily",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Erreur ajout budget");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce budget ?")) return;

    await deletePersonalBudget(id);
    setBudgets((current) => current.filter((item) => item.id !== id));
  }

  const totalAlerts = useMemo(() => {
    return budgets.filter((budget) => {
      const spent = getSpentForBudget(budget);
      const planned = Number(budget.planned_amount || 0);
      const percent = planned > 0 ? (spent / planned) * 100 : 0;

      return percent >= Number(budget.alert_threshold || 80);
    }).length;
  }, [budgets, transactions, month]);

  return (
    <div className="min-h-screen px-5 py-6 lg:px-8">
      <div className="mb-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
          Budgets
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Budgets quotidiens, hebdomadaires et mensuels
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Fixe une limite par jour, par semaine ou par mois. Exemple : Bouffe =
          10 € par jour avec alerte dès 8 €.
        </p>

        {totalAlerts > 0 && (
          <div className="mt-5 flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <p className="text-sm font-bold">
              {totalAlerts} budget(s) ont atteint ou dépassé le seuil d’alerte.
            </p>
          </div>
        )}

        <label className="mt-5 block max-w-xs">
          <span className="text-sm font-bold text-slate-700">
            Mois de référence
          </span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950"
          />
        </label>
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Ajouter une limite
              </h2>
              <p className="text-sm text-slate-500">
                Exemple : Bouffe = 10 € par jour.
              </p>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Catégorie
            </span>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  category: e.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950"
            >
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Montant limite
            </span>
            <input
              type="number"
              min="0"
              value={form.planned_amount}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  planned_amount: e.target.value,
                }))
              }
              placeholder="Ex : 10"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Période
            </span>

            <select
              value={form.period}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  period: e.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950"
            >
              <option value="daily">Par jour</option>
              <option value="weekly">Par semaine</option>
              <option value="monthly">Par mois</option>
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Alerte à partir de %
            </span>
            <input
              type="number"
              min="0"
              max="100"
              value={form.alert_threshold}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  alert_threshold: e.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950"
            />
          </label>

          <button
            disabled={saving}
            className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer la limite"}
          </button>
        </form>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">
            Suivi des limites
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Les budgets journaliers calculent seulement les dépenses du jour.
            Les budgets hebdomadaires calculent la semaine en cours.
          </p>

          <div className="mt-5 space-y-4">
            {budgets.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <PiggyBank className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 font-black text-slate-950">
                  Aucun budget défini.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Commence par Bouffe : 10 € par jour, ou Courses : 80 € par
                  semaine.
                </p>
              </div>
            )}

            {budgets.map((budget) => {
              const spent = getSpentForBudget(budget);
              const planned = Number(budget.planned_amount || 0);
              const percent =
                planned > 0 ? Math.min((spent / planned) * 100, 100) : 0;

              const realPercent =
                planned > 0 ? (spent / planned) * 100 : 0;

              const isAlert =
                realPercent >= Number(budget.alert_threshold || 80);

              const remaining = planned - spent;

              return (
                <div
                  key={budget.id}
                  className={`rounded-3xl border p-4 ${
                    isAlert
                      ? "border-rose-200 bg-rose-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-slate-950">
                          {budget.category}
                        </p>

                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                          {periodLabel(budget.period)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-500">
                        {formatMoney(spent)} € dépensés /{" "}
                        {formatMoney(planned)} € prévus
                      </p>

                      <p
                        className={`mt-1 text-sm font-bold ${
                          remaining >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {remaining >= 0
                          ? `${formatMoney(remaining)} € restants`
                          : `${formatMoney(Math.abs(remaining))} € dépassés`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(budget.id)}
                      className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-500 hover:bg-rose-100 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full ${
                        isAlert ? "bg-rose-500" : "bg-slate-950"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs font-bold text-slate-500">
                    {Math.round(realPercent)} % utilisé · alerte à{" "}
                    {budget.alert_threshold || 80} %
                  </p>

                  {isAlert && (
                    <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-rose-700">
                      Attention : tu approches de ta {periodDescription(
                        budget.period
                      )}.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}