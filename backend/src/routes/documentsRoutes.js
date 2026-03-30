import { Router } from "express";
import {
  deleteDocument,
  getDocuments,
  postDocument,
  uploadDocumentMiddleware,
} from "../controllers/documentsController.js";

const router = Router();

router.get("/", getDocuments);
router.post("/", uploadDocumentMiddleware, postDocument);
router.delete("/:id", deleteDocument);

export default router;