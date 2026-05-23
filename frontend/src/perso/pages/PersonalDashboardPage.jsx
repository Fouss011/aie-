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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PersonalDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  }, []);

  const fixedExpenses = useMemo(() => {
    return data.transactions
      .filter((t) =>
        ["Maison", "Dettes", "Abonnements"].includes(t.category)
      )
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [data.transactions]);

  async function loadDashboard() {
    try {
      setLoading(true);

      if (!userId) {
        console.warn("Aucun userId trouvé dans localStorage");
        return;
      }

      const result = await getPersonalDashboard(userId);
      setData(result);
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
            category:
              value === "income" ? "Salaire" : "Maison",
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
        transaction_date: form.transaction_date,
        note: form.note?.trim() || null,
      });

      setForm({
        type: "expense",
        label: "",
        amount: "",
        category: "Maison",
        transaction_date: todayISO(),
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
          className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
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
                      {item.category} · {item.transaction_date}
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