import { Router } from "express";
import { requestPayment, validatePayment } from "../controllers/paymentController.js";

const router = Router();

router.post("/request", requestPayment);
router.post("/validate", validatePayment);

export default router;