import { Router } from "express";
import {
  deleteExpenseItem,
  listExpenses,
  postExpense,
} from "../controllers/expensesController.js";

const router = Router();

router.get("/", listExpenses);
router.post("/", postExpense);
router.delete("/:id", deleteExpenseItem);

export default router;