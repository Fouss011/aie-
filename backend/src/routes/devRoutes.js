import { Router } from "express";
import { seedDemoData } from "../controllers/devController.js";

const router = Router();

router.post("/seed", seedDemoData);

export default router;