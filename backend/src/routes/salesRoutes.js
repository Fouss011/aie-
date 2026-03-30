import { Router } from "express";
import { listSales, postSale } from "../controllers/salesController.js";

const router = Router();

router.get("/", listSales);
router.post("/", postSale);

export default router;