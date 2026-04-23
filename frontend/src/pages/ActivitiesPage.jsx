import { useEffect, useState } from "react";
import { fetchSales } from "../api/salesApi";
import SalesForm from "../components/SalesForm";
import SalesTable from "../components/SalesTable";
import { useAuth } from "../context/AuthProvider";

export default function ActivitiesPage() {
  const { activeStructure } = useAuth();

  const [sales, setSales] = useState([]);
  const [editingSale, setEditingSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      if (!activeStructure?.id) {
        throw new Error("Aucune structure active sélectionnée.");
      }

      const salesData = await fetchSales(activeStructure.id);
      setSales(Array.isArray(salesData) ? salesData : []);
    } catch (err) {
      setError(err?.message || "Impossible de charger les recettes.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item) {
    setEditingSale(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingSale(null);
  }

  async function handleSaved() {
    setEditingSale(null);
    await loadData();
  }

  useEffect(() => {
    if (activeStructure?.id) {
      loadData();
    }
  }, [activeStructure?.id]);

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <SalesForm
          onCreated={handleSaved}
          editingSale={editingSale}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-white/45 bg-[linear-gradient(180deg,rgba(248,250,252,0.90),rgba(241,245,249,0.84))] p-10 text-center text-slate-600 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          Chargement...
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-red-200/80 bg-[linear-gradient(180deg,rgba(254,242,242,0.95),rgba(255,255,255,0.88))] p-5 text-red-700 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          {error}
        </div>
      ) : (
        <div className="rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <SalesTable
            sales={sales}
            onDeleted={loadData}
            onEdit={handleEdit}
          />
        </div>
      )}
    </div>
  );
}