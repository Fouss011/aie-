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
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function PersonalTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);

      const data = await getPersonalTransactions(userId);

      setTransactions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
  const confirmed = window.confirm(
    "Supprimer cette transaction ?"
  );

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
      const matchesSearch =
        item.label
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.category
          ?.toLowerCase()
          .includes(search.toLowerCase());

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

          <div className="flex gap-2">
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
            <p className="text-sm text-slate-500">
              Chargement...
            </p>
          )}

          {!loading &&
            filteredTransactions.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${
                      item.type === "income"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.type === "income" ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <p className="font-black text-slate-950">
                      {item.label}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {item.category} · {item.transaction_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm font-black ${
                      item.type === "income"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatMoney(item.amount)} €
                  </div>

                  <button
  onClick={() => handleDelete(item.id)}
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
  );
}