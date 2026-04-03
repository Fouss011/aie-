import { getSalesForPrompt } from "../services/salesService.js";
import { getExpensesForPrompt } from "../services/expensesService.js";
import { computeBusinessMetrics } from "../services/metricsService.js";

export async function getDashboardKpis(req, res, next) {
  try {
    const structureId = req.query.structureId || req.query.structure_id;

    if (!structureId) {
      return res.status(400).json({
        error: "structureId est obligatoire.",
      });
    }

    const [sales, expenses] = await Promise.all([
      getSalesForPrompt(structureId, 500),
      getExpensesForPrompt(structureId, 500),
    ]);

    const metrics = computeBusinessMetrics(sales, expenses);

    res.json({
      today: metrics.today,
      currentMonth: metrics.currentMonth,

      salesCount: metrics.salesCount,
      expensesCount: metrics.expensesCount,

      salesToday: metrics.salesTodayAmount,
      expensesToday: metrics.expensesTodayAmount,
      profitToday: metrics.profitToday,

      salesMonth: metrics.salesMonthAmount,
      expensesMonth: metrics.expensesMonthAmount,
      profitMonth: metrics.profitMonth,

      salesTotal: metrics.salesTotalAmount,
      expensesTotal: metrics.expensesTotalAmount,
      profitTotal: metrics.profitTotal,

      topProduct: metrics.topProductByCount?.product || "Aucune donnée",
      topProductCount: metrics.topProductByCount?.count || 0,

      topExpenseCategory:
        metrics.topExpenseCategory?.category || "Aucune donnée",
      topExpenseLabel: metrics.topExpenseLabel?.label || "Aucune donnée",

      latestSale: metrics.latestSale
        ? {
            ...metrics.latestSale,
            date: metrics.latestSale.sale_date || null,
            client: metrics.latestSale.client_name || null,
          }
        : null,

      latestExpense: metrics.latestExpense
        ? {
            ...metrics.latestExpense,
            date: metrics.latestExpense.expense_date || null,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
}