import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { PlusCircle } from "lucide-react";

import { createPersonalTransaction } from "../api/personalApi";

const EXPENSE_CATEGORIES = [
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

const INCOME_CATEGORIES = [
  "Salaire",
  "Ipsos",
  "Prime",
  "Tontine",
  "Projet",
  "Autre revenu",
];

function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function PersonalAddTransactionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    label: "",
    amount: "",
    category: "Bouffe",
    type: "expense",
    transaction_date: localDateISO(),
  });

  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "type"
        ? {
            category: value === "income" ? "Salaire" : "Bouffe",
          }
        : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.id) {
      alert("Utilisateur introuvable. Reconnecte-toi puis réessaie.");
      return;
    }

    if (!form.label.trim() || !form.amount || !form.category) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);

      await createPersonalTransaction({
        userId: user.id,
        label: form.label.trim(),
        amount: Number(form.amount),
        category: form.category,
        type: form.type,
        transaction_date: form.transaction_date || localDateISO(),
      });

      alert("Opération ajoutée avec succès ✅");

      setForm({
        label: "",
        amount: "",
        category: "Bouffe",
        type: "expense",
        transaction_date: localDateISO(),
      });
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-slate-950 text-white">
            <PlusCircle className="h-7 w-7" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              Nouvelle opération
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-950">
              Ajouter une opération
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Enregistre rapidement une dépense ou un revenu personnel.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

          <div>
            <label className="mb-2 block text-sm font-black text-slate-700">
              Libellé
            </label>

            <input
              value={form.label}
              onChange={(e) => updateField("label", e.target.value)}
              placeholder={
                form.type === "income"
                  ? "Ex : Salaire Lidl"
                  : "Ex : Repas, courses, transport..."
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-slate-950"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Montant
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                placeholder="Ex : 10"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-slate-950"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Catégorie
              </label>

              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-slate-950"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-slate-700">
              Date
            </label>

            <input
              type="date"
              value={form.transaction_date}
              onChange={(e) =>
                updateField("transaction_date", e.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-slate-950"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlusCircle className="h-5 w-5" />
            {loading ? "Ajout en cours..." : "Ajouter l’opération"}
          </button>
        </form>
      </div>
    </div>
  );
}