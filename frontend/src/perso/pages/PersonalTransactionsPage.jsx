import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Trash2,
} from "lucide-react";

import {
  getPersonalTransactions,
  deletePersonalTransaction,
} from "../api/personalApi";

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function normalizeDate(value) {
  if (!value) return "";

  return String(value).slice(0, 10);
}

export default function PersonalTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId]);

  async function loadTransactions() {
    try {
      setLoading(true);

      const data = await getPersonalTransactions(userId);

      setTransactions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Supprimer cette transaction ?");

    if (!confirmed) {
      return;
    }

    try {
      await deletePersonalTransaction(id);

      setTransactions((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Erreur suppression");
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        item.label?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ? true : item.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  return (
    <div className="min-h-screen px-5 py-6 lg:px-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              Historique
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Transactions personnelles
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Toutes tes opérations du quotidien.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-2xl px-4 py-3 text-sm font-black ${
                filter === "all"
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Tout
            </button>

            <button
              onClick={() => setFilter("income")}
              className={`rounded-2xl px-4 py-3 text-sm font-black ${
                filter === "income"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Revenus
            </button>

            <button
              onClick={() => setFilter("expense")}
              className={`rounded-2xl px-4 py-3 text-sm font-black ${
                filter === "expense"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Dépenses
            </button>
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une opération..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm outline-none focus:border-slate-950"
          />
        </div>

        <div className="mt-6 space-y-3">
          {loading && (
            <p className="text-sm text-slate-500">Chargement...</p>
          )}

          {!loading && filteredTransactions.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="font-black text-slate-950">
                Aucune transaction trouvée.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Essaie un autre filtre ou une autre recherche.
              </p>
            </div>
          )}

          {!loading &&
            filteredTransactions.map((item) => {
              const isIncome = item.type === "income";

              return (
                <div
  key={item.id}
  className="grid grid-cols-[44px_minmax(0,1fr)_auto_44px] items-center gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[48px_minmax(0,1fr)_auto_48px] sm:p-4"
>
  <div
    className={`grid h-11 w-11 place-items-center rounded-2xl sm:h-12 sm:w-12 ${
      isIncome
        ? "bg-emerald-100 text-emerald-700"
        : "bg-rose-100 text-rose-700"
    }`}
  >
    {isIncome ? (
      <ArrowUpRight className="h-5 w-5" />
    ) : (
      <ArrowDownLeft className="h-5 w-5" />
    )}
  </div>

  <div className="min-w-0">
    <p className="truncate text-sm font-black text-slate-950 sm:text-base">
      {item.label}
    </p>

    <p className="mt-1 truncate text-xs font-bold text-slate-500">
      {item.category} · {normalizeDate(item.transaction_date)}
    </p>
  </div>

  <div
    className={`shrink-0 whitespace-nowrap rounded-2xl px-3 py-2 text-right text-sm font-black ${
      isIncome
        ? "bg-emerald-100 text-emerald-700"
        : "bg-rose-100 text-rose-700"
    }`}
  >
    {isIncome ? "+" : "-"}
    {formatMoney(item.amount)} €
  </div>

  <button
    onClick={() => handleDelete(item.id)}
    className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-slate-500 transition hover:bg-rose-100 hover:text-rose-600 sm:h-11 sm:w-11"
  >
    <Trash2 className="h-4 w-4" />
  </button>
</div>
              );
            })}
        </div>
      </div>
    </div>
  );
}