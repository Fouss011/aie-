import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Plus,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../context/AuthProvider";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

const CATEGORIES = [
  "Maison",
  "Bouffe",
  "Transport",
  "Abonnements",
  "Santé",
  "Famille",
  "Dettes",
  "Loisirs",
  "Divers",
];

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function PersonalRecurringExpensesPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [expenses, setExpenses] = useState([]);

  const [form, setForm] = useState({
    label: "",
    amount: "",
    category: "Maison",
    recurring_day: 5,
  });

  useEffect(() => {
    loadExpenses();
  }, [userId]);

  async function loadExpenses() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/personal/recurring-expenses?userId=${userId}`
      );

      const data = await response.json();

      setExpenses(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.label || !form.amount) {
      alert("Complète les champs.");
      return;
    }

    try {
      setSaving(true);

      await fetch(
        `${API_URL}/api/personal/recurring-expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            label: form.label,
            amount: Number(form.amount),
            category: form.category,
            recurring_day: Number(form.recurring_day),
          }),
        }
      );

      setForm({
        label: "",
        amount: "",
        category: "Maison",
        recurring_day: 5,
      });

      await loadExpenses();
    } catch (error) {
      console.error(error);
      alert("Erreur ajout charge fixe");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Supprimer cette charge fixe ?"
    );

    if (!confirmed) return;

    try {
      await fetch(
        `${API_URL}/api/personal/recurring-expenses/${id}`,
        {
          method: "DELETE",
        }
      );

      setExpenses((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  }

  const totalRecurring = useMemo(() => {
    return expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  }, [expenses]);

  return (
    <div className="min-h-screen px-5 py-6 lg:px-8">
      <div className="mb-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
          Charges fixes
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Dépenses automatiques
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Configure les dépenses qui reviennent chaque mois :
          loyer, Netflix, parents, salle, transport...
        </p>

        <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-bold text-slate-600">
            Total charges fixes mensuelles
          </p>

          <p className="mt-2 text-4xl font-black text-slate-950">
            {formatMoney(totalRecurring)} €
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
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
                Ajouter une charge fixe
              </h2>

              <p className="text-sm text-slate-500">
                Exemple : Loyer, Netflix, salle...
              </p>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Libellé
            </span>

            <input
              value={form.label}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  label: e.target.value,
                }))
              }
              placeholder="Ex : Loyer"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Montant
            </span>

            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  amount: e.target.value,
                }))
              }
              placeholder="Ex : 700"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
            />
          </label>

          <label className="mt-4 block">
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
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
            >
              {CATEGORIES.map((category) => (
                <option key={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Jour du mois
            </span>

            <div className="relative mt-2">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="number"
                min="1"
                max="31"
                value={form.recurring_day}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    recurring_day: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-950"
              />
            </div>
          </label>

          <button
            disabled={saving}
            className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving
              ? "Ajout..."
              : "Ajouter la charge fixe"}
          </button>
        </form>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">
            Charges enregistrées
          </h2>

          <div className="mt-5 space-y-3">
            {!loading && expenses.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="font-black text-slate-950">
                  Aucune charge fixe.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Ajoute ton loyer, abonnements, salle, etc.
                </p>
              </div>
            )}

            {expenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4"
              >
                <div>
                  <p className="font-black text-slate-950">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {item.category} · Jour {item.recurring_day}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-950">
                    {formatMoney(item.amount)} €
                  </div>

                  <button
                    onClick={() =>
                      handleDelete(item.id)
                    }
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-500 transition hover:bg-rose-100 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}