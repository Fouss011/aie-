import { Router } from "express";
import {
  deleteSaleItem,
  listSales,
  postSale,
  putSale,
} from "../controllers/salesController.js";

const router = Router();

router.get("/", listSales);
router.post("/", postSale);
router.put("/:id", putSale);
router.delete("/:id", deleteSaleItem);

export default router;