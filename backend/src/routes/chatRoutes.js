import { Router } from "express";
import { askChat } from "../controllers/chatController.js";
import { accessGuard } from "../middleware/accessGuard.js";

const router = Router();

router.post("/", accessGuard, askChat);

export default router;