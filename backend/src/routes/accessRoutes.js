import { Router } from "express";
import { getAccessStatus } from "../controllers/accessController.js";

const router = Router();

router.get("/status", getAccessStatus);

export default router;