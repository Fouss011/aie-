import { askSalesAssistant } from "../services/chatService.js";

export async function askChat(req, res, next) {
  try {
    const { question } = req.body;

    if (!question || !String(question).trim()) {
      return res.status(400).json({
        error: "question est obligatoire.",
      });
    }

    const result = await askSalesAssistant(question);
    res.json(result);
  } catch (error) {
    next(error);
  }
}