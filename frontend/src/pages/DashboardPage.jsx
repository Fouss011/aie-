import { useEffect, useMemo, useState } from "react";
import { fetchSales } from "../api/salesApi";
import { fetchExpenses } from "../api/expensesApi";
import { fetchDashboardKpis } from "../api/dashboardApi";
import KpiGrid from "../components/KpiGrid";
import MonthlyFinanceOverview from "../components/MonthlyFinanceOverview";
import { useAuth } from "../context/AuthProvider";
import InsightCard from "../components/InsightCard";
import { generateInsight } from "../utils/insightEngine";
import PremiumLockCard from "../components/PremiumLockCard";
import { getTrialStatus } from "../utils/access";

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonthPrefix() {
  return getTodayString().slice(0, 7);
}

function normalizeDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

// ✅ NOUVEAU : calcul local des KPI
function buildLocalKpis(sales = [], expenses = []) {
  const today = getTodayString();
  const currentMonth = getCurrentMonthPrefix();

  let salesToday = 0;
  let expensesToday = 0;
  let salesMonth = 0;
  let expensesMonth = 0;

  const productCount = new Map();

  sales.forEach((item) => {
    const amount = Number(item.amount || 0);
    const itemDate = normalizeDate(item.sale_date || item.date);

    if (itemDate === today) {
      salesToday += amount;
    }

    if (itemDate.startsWith(currentMonth)) {
      salesMonth += amount;
    }

    const product = item.product || "Aucune donnée";
    productCount.set(product, (productCount.get(product) || 0) + 1);
  });

  expenses.forEach((item) => {
    const amount = Number(item.amount || 0);
    const itemDate = normalizeDate(item.expense_date || item.date);

    if (itemDate === today) {
      expensesToday += amount;
    }

    if (itemDate.startsWith(currentMonth)) {
      expensesMonth += amount;
    }
  });

  let topProduct = "Aucune donnée";
  let bestCount = 0;

  productCount.forEach((count, product) => {
    if (count > bestCount) {
      bestCount = count;
      topProduct = product;
    }
  });

  return {
    salesToday,
    expensesToday,
    profitToday: salesToday - expensesToday,
    salesMonth,
    expensesMonth,
    profitMonth: salesMonth - expensesMonth,
    salesCount: sales.length,
    expensesCount: expenses.length,
    topProduct,
  };
}

export default function DashboardPage() {
  const { activeStructure, logout } = useAuth();

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const trialStatus = getTrialStatus(activeStructure);
  const canUsePremium = trialStatus.isTrialActive;

  const insight = useMemo(() => {
    const today = getTodayString();
    const currentMonth = getCurrentMonthPrefix();

    const salesToday = sales.reduce((total, item) => {
      const itemDate = normalizeDate(item.sale_date || item.date);
      return itemDate === today ? total + Number(item.amount || 0) : total;
    }, 0);

    const expensesToday = expenses.reduce((total, item) => {
      const itemDate = normalizeDate(item.expense_date || item.date);
      return itemDate === today ? total + Number(item.amount || 0) : total;
    }, 0);

    const monthSales = sales.reduce((total, item) => {
      const itemDate = normalizeDate(item.sale_date || item.date);
      return itemDate.startsWith(currentMonth)
        ? total + Number(item.amount || 0)
        : total;
    }, 0);

    const monthExpenses = expenses.reduce((total, item) => {
      const itemDate = normalizeDate(item.expense_date || item.date);
      return itemDate.startsWith(currentMonth)
        ? total + Number(item.amount || 0)
        : total;
    }, 0);

    return generateInsight({
      salesToday,
      expensesToday,
      monthSales,
      monthExpenses,
    });
  }, [sales, expenses]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const structureId = activeStructure?.id;

      if (!structureId) {
        throw new Error("Aucune structure active sélectionnée.");
      }

      const [salesData, expensesData, kpisData] = await Promise.all([
        fetchSales(structureId),
        fetchExpenses(structureId),
        fetchDashboardKpis(structureId),
      ]);

      const safeSales = Array.isArray(salesData) ? salesData : [];
      const safeExpenses = Array.isArray(expensesData) ? expensesData : [];

      setSales(safeSales);
      setExpenses(safeExpenses);

      // ✅ calcul local
      const localKpis = buildLocalKpis(safeSales, safeExpenses);

      setKpis({
        ...localKpis,
        ...(kpisData || {}),
        salesToday: localKpis.salesToday,
        expensesToday: localKpis.expensesToday,
      });
    } catch (err) {
      setError(err?.message || "Une erreur est survenue lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  }

  useEffect(() => {
    if (activeStructure?.id) {
      loadData();
    }
  }, [activeStructure?.id]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-5">
      <KpiGrid kpis={kpis} />

      <div>
        <p>Recettes du jour : {kpis?.salesToday} FCFA</p>
        <p>Dépenses du jour : {kpis?.expensesToday} FCFA</p>
      </div>

      {canUsePremium ? (
        <InsightCard insight={insight} />
      ) : (
        <PremiumLockCard
          title="Analyse intelligente réservée"
          message="Active ton abonnement pour débloquer."
        />
      )}

      <MonthlyFinanceOverview sales={sales} expenses={expenses} />

      <button onClick={handleLogout}>Déconnexion</button>
    </div>
  );
}