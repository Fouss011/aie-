import { useState } from "react";
import { createStructure } from "../lib/auth";
import { useAuth } from "../context/AuthProvider";

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function StructureSetupScreen() {
  const { refreshAccountData, logout } = useAuth();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("TG");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorText("");

    try {
      await createStructure({
        name,
        slug: slugify(slug || name),
        sector,
        country,
        city,
      });

      await refreshAccountData();
    } catch (error) {
      console.error("Erreur création structure:", error);
      setErrorText(
        error?.message || "Impossible de créer ou recharger la structure."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      setErrorText(error?.message || "Impossible de se déconnecter.");
    }
  }

  return (
    <div className="min-h-screen bg-[#E7EDF5] px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
              AIE PRO
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-950">
              Créer ta structure
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Dernière étape : crée l’espace sécurisé de ta structure pour isoler
              tes données.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Déconnexion
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nom de la structure
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const nextName = e.target.value;
                setName(nextName);

                if (!slugTouched) {
                  setSlug(slugify(nextName));
                }
              }}
              placeholder="Ex: Clinique Espoir"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="clinique-espoir"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Secteur
            </label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Santé, commerce, école..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Pays
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="TG"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Ville
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Lomé"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          {errorText && (
            <div className="sm:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorText}
            </div>
          )}

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(11,31,58,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Création..." : "Créer ma structure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}