import { createSale } from "./salesService.js";
import { createExpense } from "./expensesService.js";

function normalizeDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);

  if (typeof value === "string") {
    const trimmed = value.trim();

    // format dd/mm/yyyy
    const frMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (frMatch) {
      const [, day, month, year] = frMatch;
      return `${year}-${month}-${day}`;
    }

    // format yyyy-mm-dd
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return trimmed;

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return new Date().toISOString().slice(0, 10);
}

function normalizeAmount(value) {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = String(value).replace(/\s/g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function importActivities(rows = []) {
  const results = [];

  for (const row of rows) {
    if (!row?.label || row?.amount === undefined || row?.amount === "") {
      continue;
    }

    const created = await createSale({
      product: row.label,
      amount: normalizeAmount(row.amount),
      client_name: row.contact || null,
      sale_date: normalizeDate(row.date),
    });

    results.push(created);
  }

  return results;
}

export async function importCharges(rows = []) {
  const results = [];

  for (const row of rows) {
    if (!row?.label || row?.amount === undefined || row?.amount === "") {
      continue;
    }

    const created = await createExpense({
      label: row.label,
      amount: normalizeAmount(row.amount),
      category: row.category || null,
      expense_date: normalizeDate(row.date),
    });

    results.push(created);
  }

  return results;
}