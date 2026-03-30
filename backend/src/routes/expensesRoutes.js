import { Router } from "express";
import { listExpenses, postExpense } from "../controllers/expensesController.js";

const router = Router();

router.get("/", listExpenses);
router.post("/", postExpense);

export default router;