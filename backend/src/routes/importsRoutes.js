import { Router } from "express";
import {
  postActivitiesImport,
  postChargesImport,
} from "../controllers/importsController.js";

const router = Router();

router.post("/activities", postActivitiesImport);
router.post("/charges", postChargesImport);

export default router;