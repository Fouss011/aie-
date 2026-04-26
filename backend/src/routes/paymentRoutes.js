import { Router } from "express";
import {
  requestPayment,
  validatePayment,
  cinetpayNotify,
} from "../controllers/paymentController.js";

const router = Router();

router.post("/request", requestPayment);
router.post("/validate", validatePayment);
router.post("/cinetpay/notify", cinetpayNotify);

export default router;