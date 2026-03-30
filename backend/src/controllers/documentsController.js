import multer from "multer";
import {
  createDocumentRecord,
  listDocuments,
  removeDocument,
  uploadDocumentToStorage,
} from "../services/documentsService.js";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadDocumentMiddleware = upload.single("file");

function mapDocumentForFrontend(doc) {
  return {
    ...doc,
    linkedTo: doc.linked_to || null,
    linkedKind: doc.linked_kind || null,
    fileName: doc.file_name || null,
    filePath: doc.file_path || null,
    fileType: doc.file_type || null,
    fileSize: doc.file_size || null,
    publicUrl: doc.public_url || null,
  };
}

export async function postDocument(req, res, next) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "Le fichier est obligatoire.",
      });
    }

    const { label, linkedTo, linkedKind } = req.body;

    const uploaded = await uploadDocumentToStorage({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });

    const created = await createDocumentRecord({
      label,
      linkedTo,
      linkedKind,
      fileName: file.originalname,
      filePath: uploaded.filePath,
      fileType: file.mimetype,
      fileSize: file.size,
      publicUrl: uploaded.publicUrl,
    });

    res.status(201).json(mapDocumentForFrontend(created));
  } catch (error) {
    next(error);
  }
}

export async function getDocuments(req, res, next) {
  try {
    const docs = await listDocuments(100);
    res.json(docs.map(mapDocumentForFrontend));
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const removed = await removeDocument(req.params.id);
    res.json({
      message: "Document supprimé.",
      item: mapDocumentForFrontend(removed),
    });
  } catch (error) {
    next(error);
  }
}