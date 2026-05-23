import { useEffect, useMemo, useState } from "react";
import { PiggyBank, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

import {
  createPersonalSaving,
  deletePersonalSaving,
  getPersonalSavings,
  updatePersonalSaving,
} from "../api/personalApi";

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function PersonalSavingsPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [goals, setGoals] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    target_amount: "",
    current_amount: "",
    target_date: "",
  });

  useEffect(() => {
    loadGoals();
  }, [userId]);

  async function loadGoals() {
    if (!userId) return;

    try {
      const data = await getPersonalSavings(userId);
      setGoals(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();

    if (!form.title || !form.target_amount) {
      alert("Ajoute un nom et un montant cible.");
      return;
    }

    try {
      setSaving(true);

      await createPersonalSaving({
        userId,
        title: form.title,
        target_amount: Number(form.target_amount),
        current_amount: Number(form.current_amount || 0),
        target_date: form.target_date || null,
        status: "active",
      });

      setForm({
        title: "",
        target_amount: "",
        current_amount: "",
        target_date: "",
      });

      await loadGoals();
    } catch (error) {
      console.error(error);
      alert("Erreur création objectif");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAmount(goal) {
    const value = window.prompt("Montant à ajouter à cet objectif ?");

    if (!value) return;

    const amount = Number(value);

    if (Number.isNaN(amount) || amount <= 0) {
      alert("Montant invalide.");
      return;
    }

    const nextAmount = Number(goal.current_amount || 0) + amount;
    const nextStatus =
      nextAmount >= Number(goal.target_amount) ? "completed" : "active";

    try {
      await updatePersonalSaving(goal.id, {
        current_amount: nextAmount,
        status: nextStatus,
      });

      await loadGoals();
    } catch (error) {
      console.error(error);
      alert("Erreur mise à jour");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cet objectif ?")) return;

    try {
      await deletePersonalSaving(id);
      setGoals((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erreur suppression");
    }
  }

  const totalSaved = useMemo(() => {
    return goals.reduce(
      (sum, item) => sum + Number(item.current_amount || 0),
      0
    );
  }, [goals]);

  const totalTarget = useMemo(() => {
    return goals.reduce(
      (sum, item) => sum + Number(item.target_amount || 0),
      0
    );
  }, [goals]);

  return (
    <div className="min-h-screen px-5 py-6 lg:px-8">
      <div className="mb-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
          Épargne
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Objectifs d’épargne
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Prépare tes projets : formation, urgence, voyage, investissement ou
          sécurité familiale.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-700">
              Total déjà mis de côté
            </p>
            <p className="mt-2 text-4xl font-black text-emerald-950">
              {formatMoney(totalSaved)} €
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-700">
              Objectif total
            </p>
            <p className="mt-2 text-4xl font-black text-blue-950">
              {formatMoney(totalTarget)} €
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleCreate}
          className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Nouvel objectif
              </h2>
              <p className="text-sm text-slate-500">
                Exemple : Formation Le Wagon.
              </p>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Nom de l’objectif
            </span>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  title: e.target.value,
                }))
              }
              placeholder="Ex : Formation Le Wagon"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Montant cible
            </span>
            <input
              type="number"
              min="0"
              value={form.target_amount}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  target_amount: e.target.value,
                }))
              }
              placeholder="Ex : 4500"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Déjà épargné
            </span>
            <input
              type="number"
              min="0"
              value={form.current_amount}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  current_amount: e.target.value,
                }))
              }
              placeholder="Ex : 300"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Date cible
            </span>
            <input
              type="date"
              value={form.target_date}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  target_date: e.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
            />
          </label>

          <button
            disabled={saving}
            className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Création..." : "Créer l’objectif"}
          </button>
        </form>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">
            Mes objectifs
          </h2>

          <div className="mt-5 space-y-4">
            {goals.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <PiggyBank className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 font-black text-slate-950">
                  Aucun objectif d’épargne.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Crée ton premier objectif : formation, urgence ou projet.
                </p>
              </div>
            )}

            {goals.map((goal) => {
              const current = Number(goal.current_amount || 0);
              const target = Number(goal.target_amount || 0);
              const percent =
                target > 0 ? Math.min((current / target) * 100, 100) : 0;
              const remaining = target - current;

              return (
                <div
                  key={goal.id}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-slate-950">
                        {goal.title}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        {formatMoney(current)} € / {formatMoney(target)} €
                      </p>
                      {goal.target_date && (
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          Date cible : {goal.target_date}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-500 hover:bg-rose-100 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full ${
                        goal.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-slate-950"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-500">
                      {Math.round(percent)} % atteint ·{" "}
                      {remaining > 0
                        ? `${formatMoney(remaining)} € restants`
                        : "objectif atteint"}
                    </p>

                    <button
                      onClick={() => handleAddAmount(goal)}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
                    >
                      Ajouter de l’argent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}