import { Router } from "express";

import {
  dashboard,
  createTransaction,
  transactions,
  removeTransaction,
  budgets,
  createBudget,
  removeBudget,
  recurringExpenses,
  createRecurringExpense,
  removeRecurringExpense, 
  savingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  removeSavingsGoal,
  personalCopilot,
} from "../controllers/personal.controller.js";

const router = Router();

router.get("/dashboard", dashboard);
router.get("/transactions", transactions);
router.post("/transactions", createTransaction);
router.delete("/transactions/:id", removeTransaction);
router.get("/budgets", budgets);
router.post("/budgets", createBudget);
router.delete("/budgets/:id", removeBudget);
router.get("/recurring-expenses", recurringExpenses);
router.post("/recurring-expenses", createRecurringExpense);
router.delete("/recurring-expenses/:id", removeRecurringExpense);
router.get("/savings", savingsGoals);

router.post("/savings", createSavingsGoal);

router.patch("/savings/:id", updateSavingsGoal);

router.delete("/savings/:id", removeSavingsGoal);
router.post("/copilot", personalCopilot);

export default router;