import { createSale, getRecentSales } from "../services/salesService.js";

function mapSaleForFrontend(sale) {
  return {
    ...sale,
    date: sale.sale_date || null,
    client: sale.client_name || null,
  };
}

export async function postSale(req, res, next) {
  try {
    const { product, amount, client, client_name, sale_date } = req.body;

    if (!product || amount === undefined || !sale_date) {
      return res.status(400).json({
        error: "product, amount et sale_date sont obligatoires.",
      });
    }

    const created = await createSale({
      product,
      amount,
      client_name: client_name || client || null,
      sale_date,
    });

    res.status(201).json(mapSaleForFrontend(created));
  } catch (error) {
    next(error);
  }
}

export async function listSales(req, res, next) {
  try {
    const sales = await getRecentSales(100);
    res.json((sales || []).map(mapSaleForFrontend));
  } catch (error) {
    next(error);
  }
}