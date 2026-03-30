import { importActivities, importCharges } from "../services/importsService.js";

export async function postActivitiesImport(req, res, next) {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        error: "rows est obligatoire et doit contenir au moins une ligne.",
      });
    }

    const created = await importActivities(rows);

    res.status(201).json({
      message: `${created.length} activité(s) importée(s).`,
      count: created.length,
      items: created,
    });
  } catch (error) {
    next(error);
  }
}

export async function postChargesImport(req, res, next) {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        error: "rows est obligatoire et doit contenir au moins une ligne.",
      });
    }

    const created = await importCharges(rows);

    res.status(201).json({
      message: `${created.length} charge(s) importée(s).`,
      count: created.length,
      items: created,
    });
  } catch (error) {
    next(error);
  }
}