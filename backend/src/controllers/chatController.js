import { askSalesAssistant } from "../services/chatService.js";

export async function askChat(req, res, next) {
  try {
    const { question, structureId, structure_id } = req.body;

    const finalStructureId = structureId || structure_id;

    if (!question || !String(question).trim()) {
      return res.status(400).json({
        error: "question est obligatoire.",
      });
    }

    if (!finalStructureId) {
      return res.status(400).json({
        error: "structureId est obligatoire.",
      });
    }

    const result = await askSalesAssistant(question, finalStructureId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}