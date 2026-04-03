import { useEffect, useState } from "react";
import { fetchExpenses } from "../api/expensesApi";
import ExpenseForm from "../components/ExpenseForm";
import ExpensesTable from "../components/ExpensesTable";
import { useAuth } from "../context/AuthProvider";

export default function ChargesPage() {
  const { activeStructure } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      if (!activeStructure?.id) {
        throw new Error("Aucune structure active sélectionnée.");
      }

      const expensesData = await fetchExpenses(activeStructure.id);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (err) {
      setError(err?.message || "Impossible de charger les charges.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeStructure?.id) {
      loadData();
    }
  }, [activeStructure?.id]);

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(241,245,249,0.82))] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <ExpenseForm onCreated={loadData} />
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
          <ExpensesTable expenses={expenses} onDeleted={loadData} />
        </div>
      )}
    </div>
  );
}