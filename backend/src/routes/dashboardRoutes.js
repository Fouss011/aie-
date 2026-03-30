import { Router } from "express";
import { getDashboardKpis } from "../controllers/dashboardController.js";

const router = Router();

router.get("/kpis", getDashboardKpis);

export default router;