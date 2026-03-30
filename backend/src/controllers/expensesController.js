import {
  createExpense,
  getRecentExpenses,
} from "../services/expensesService.js";

function mapExpenseForFrontend(expense) {
  return {
    ...expense,
    date: expense.expense_date || null,
  };
}

export async function postExpense(req, res, next) {
  try {
    const { label, amount, category, expense_date } = req.body;

    if (!label || amount === undefined || !expense_date) {
      return res.status(400).json({
        error: "label, amount et expense_date sont obligatoires.",
      });
    }

    const created = await createExpense({
      label,
      amount,
      category,
      expense_date,
    });

    res.status(201).json(mapExpenseForFrontend(created));
  } catch (error) {
    next(error);
  }
}

export async function listExpenses(req, res, next) {
  try {
    const expenses = await getRecentExpenses(100);
    res.json((expenses || []).map(mapExpenseForFrontend));
  } catch (error) {
    next(error);
  }
}