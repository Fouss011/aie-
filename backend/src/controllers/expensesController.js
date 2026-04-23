import {
  createExpense,
  deleteExpense,
  getRecentExpenses,
  updateExpense,
} from "../services/expensesService.js";

function mapExpenseForFrontend(expense) {
  return {
    ...expense,
    date: expense.expense_date || null,
  };
}

export async function postExpense(req, res, next) {
  try {
    const {
      label,
      amount,
      category,
      expense_date,
      structure_id,
      structureId,
    } = req.body;

    const finalStructureId = structure_id || structureId;

    if (!label || amount === undefined || !expense_date || !finalStructureId) {
      return res.status(400).json({
        error: "label, amount, expense_date et structure_id sont obligatoires.",
      });
    }

    const created = await createExpense({
      label,
      amount,
      category,
      expense_date,
      structure_id: finalStructureId,
    });

    res.status(201).json(mapExpenseForFrontend(created));
  } catch (error) {
    next(error);
  }
}

export async function putExpense(req, res, next) {
  try {
    const { id } = req.params;
    const {
      label,
      amount,
      category,
      expense_date,
      structure_id,
      structureId,
    } = req.body;

    const finalStructureId = structure_id || structureId;

    if (!id) {
      return res.status(400).json({
        error: "id est obligatoire.",
      });
    }

    if (!label || amount === undefined || !expense_date || !finalStructureId) {
      return res.status(400).json({
        error: "label, amount, expense_date et structure_id sont obligatoires.",
      });
    }

    const updated = await updateExpense(id, {
      label,
      amount,
      category,
      expense_date,
      structure_id: finalStructureId,
    });

    if (!updated) {
      return res.status(404).json({
        error: "Dépense introuvable ou non autorisée pour cette structure.",
      });
    }

    res.json(mapExpenseForFrontend(updated));
  } catch (error) {
    next(error);
  }
}

export async function listExpenses(req, res, next) {
  try {
    const structureId = req.query.structureId || req.query.structure_id;

    if (!structureId) {
      return res.status(400).json({
        error: "structureId est obligatoire.",
      });
    }

    const expenses = await getRecentExpenses(structureId, 100);
    res.json((expenses || []).map(mapExpenseForFrontend));
  } catch (error) {
    next(error);
  }
}

export async function deleteExpenseItem(req, res, next) {
  try {
    const { id } = req.params;
    const structureId = req.query.structureId || req.query.structure_id;

    if (!id) {
      return res.status(400).json({ error: "id est obligatoire." });
    }

    if (!structureId) {
      return res.status(400).json({ error: "structureId est obligatoire." });
    }

    const deleted = await deleteExpense(id, structureId);

    if (!deleted) {
      return res.status(404).json({
        error: "Dépense introuvable ou non autorisée pour cette structure.",
      });
    }

    res.json({
      success: true,
      deleted: mapExpenseForFrontend(deleted),
    });
  } catch (error) {
    next(error);
  }
}