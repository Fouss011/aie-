import { Router } from "express";
import {
  deleteExpenseItem,
  listExpenses,
  postExpense,
  putExpense,
} from "../controllers/expensesController.js";

const router = Router();

router.get("/", listExpenses);
router.post("/", postExpense);
router.put("/:id", putExpense);
router.delete("/:id", deleteExpenseItem);

export default router;