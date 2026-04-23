import { useEffect, useState } from "react";
import { createSale, updateSale } from "../api/salesApi";
import { useAuth } from "../context/AuthProvider";

const initialForm = {
  product: "",
  amount: "",
  client: "",
  sale_date: new Date().toISOString().slice(0, 10),
};

export default function SalesForm({
  onCreated,
  editingSale = null,
  onCancelEdit,
}) {
  const { activeStructure } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEditing = Boolean(editingSale?.id);

  useEffect(() => {
    if (editingSale) {
      setForm({
        product: editingSale.product || "",
        amount: editingSale.amount ?? "",
        client: editingSale.client || editingSale.contact || "",
        sale_date:
          editingSale.sale_date ||
          editingSale.date ||
          new Date().toISOString().slice(0, 10),
      });
      setError("");
      setSuccess("");
    } else {
      setForm(initialForm);
    }
  }, [editingSale]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (isEditing) {
        await updateSale(editingSale.id, payload, activeStructure?.id);
        setSuccess("Recette modifiée avec succès.");
      } else {
        await createSale(payload, activeStructure?.id);
        setSuccess("Recette enregistrée avec succès.");
      }

      setForm(initialForm);
      onCreated?.();
    } catch (err) {
      setError(
        err?.message ||
          (isEditing
            ? "Impossible de modifier la recette."
            : "Impossible d'enregistrer la recette.")
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setForm(initialForm);
    setError("");
    setSuccess("");
    onCancelEdit?.();
  }

  return (
    <section className="rounded-[28px] border border-white/45 bg-[linear-gradient(180deg,rgba(248,250,252,0.90),rgba(241,245,249,0.84))] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-blue-700">
          Recettes
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          {isEditing ? "Modifier une recette" : "Ajouter une recette"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enregistre une vente, une prestation ou une activité génératrice de revenu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Produit / Recette
          </label>
          <input
            name="product"
            type="text"
            placeholder="Ex : Vidange, publicité, maintenance..."
            value={form.product}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Montant
          </label>
          <input
            name="amount"
            type="number"
            placeholder="Ex : 25000"
            value={form.amount}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Client
          </label>
          <input
            name="client"
            type="text"
            placeholder="Ex : Kossi"
            value={form.client}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            name="sale_date"
            type="date"
            value={form.sale_date}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          {isEditing ? (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Annuler
            </button>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#0B1F3A] px-5 py-3 font-medium text-white transition hover:bg-[#102949] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? isEditing
                ? "Mise à jour..."
                : "Enregistrement..."
              : isEditing
              ? "Mettre à jour la recette"
              : "Ajouter la recette"}
          </button>
        </div>
      </form>

      {success && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </section>
  );
}