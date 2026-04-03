import { Router } from "express";
import { deleteSaleItem, listSales, postSale } from "../controllers/salesController.js";

const router = Router();

router.get("/", listSales);
router.post("/", postSale);
router.delete("/:id", deleteSaleItem);

export default router;