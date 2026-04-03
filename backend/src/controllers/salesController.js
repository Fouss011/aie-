import {
  createSale,
  deleteSale,
  getRecentSales,
} from "../services/salesService.js";

function mapSaleForFrontend(sale) {
  return {
    ...sale,
    date: sale.sale_date || null,
    client: sale.client_name || null,
  };
}

export async function postSale(req, res, next) {
  try {
    const {
      product,
      amount,
      client,
      client_name,
      sale_date,
      structure_id,
      structureId,
    } = req.body;

    const finalStructureId = structure_id || structureId;

    if (!product || amount === undefined || !sale_date || !finalStructureId) {
      return res.status(400).json({
        error: "product, amount, sale_date et structure_id sont obligatoires.",
      });
    }

    const created = await createSale({
      product,
      amount,
      client_name: client_name || client || null,
      sale_date,
      structure_id: finalStructureId,
    });

    res.status(201).json(mapSaleForFrontend(created));
  } catch (error) {
    next(error);
  }
}

export async function listSales(req, res, next) {
  try {
    const structureId = req.query.structureId || req.query.structure_id;

    if (!structureId) {
      return res.status(400).json({
        error: "structureId est obligatoire.",
      });
    }

    const sales = await getRecentSales(structureId, 100);
    res.json((sales || []).map(mapSaleForFrontend));
  } catch (error) {
    next(error);
  }
}

export async function deleteSaleItem(req, res, next) {
  try {
    const { id } = req.params;
    const structureId = req.query.structureId || req.query.structure_id;

    if (!id) {
      return res.status(400).json({ error: "id est obligatoire." });
    }

    if (!structureId) {
      return res.status(400).json({ error: "structureId est obligatoire." });
    }

    const deleted = await deleteSale(id, structureId);

    if (!deleted) {
      return res.status(404).json({
        error: "Activité introuvable ou non autorisée pour cette structure.",
      });
    }

    res.json({
      success: true,
      deleted: mapSaleForFrontend(deleted),
    });
  } catch (error) {
    next(error);
  }
}