import { resetAndSeedDemoData } from "../services/devSeedService.js";

export async function seedDemoData(req, res, next) {
  try {
    const result = await resetAndSeedDemoData();

    res.json({
      ok: true,
      message: "Données de démo réinjectées avec succès.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}