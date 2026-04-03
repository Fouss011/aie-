const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function parseDate(value) {
  if (!value) return null;

  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d;

  if (typeof value === "string" && value.includes("/")) {
    const [day, month, year] = value.split("/");
    const alt = new Date(`${year}-${month}-${day}`);
    if (!Number.isNaN(alt.getTime())) return alt;
  }

  return null;
}

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthLabel(date) {
  const label = MONTH_FORMATTER.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatMoney(value) {
  return `${Number(value ?? 0).toLocaleString("fr-FR")} FCFA`;
}

export function formatDisplayDate(value) {
  const d = parseDate(value);
  return d ? DATE_FORMATTER.format(d) : value || "-";
}

export function groupItemsByMonth(
  items = [],
  { dateFieldCandidates = ["date"], amountField = "amount" } = {}
) {
  const map = new Map();

  items.forEach((item) => {
    const rawDate = dateFieldCandidates
      .map((field) => item?.[field])
      .find(Boolean);

    const date = parseDate(rawDate);
    const fallbackKey = "unknown";
    const key = date ? getMonthKey(date) : fallbackKey;
    const label = date ? getMonthLabel(date) : "Sans date";

    if (!map.has(key)) {
      map.set(key, {
        key,
        label,
        sortValue: date ? date.getTime() : 0,
        total: 0,
        items: [],
      });
    }

    const current = map.get(key);
    current.items.push(item);
    current.total += Number(item?.[amountField] ?? 0);
  });

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => {
        const da = parseDate(
          dateFieldCandidates.map((f) => a?.[f]).find(Boolean)
        );
        const db = parseDate(
          dateFieldCandidates.map((f) => b?.[f]).find(Boolean)
        );
        return (db?.getTime?.() || 0) - (da?.getTime?.() || 0);
      }),
    }))
    .sort((a, b) => b.sortValue - a.sortValue);
}

export function buildMonthlyFinanceRows(sales = [], expenses = []) {
  const map = new Map();

  const ensureMonth = (dateValue) => {
    const date = parseDate(dateValue);
    const fallbackKey = "unknown";
    const key = date ? getMonthKey(date) : fallbackKey;
    const label = date ? getMonthLabel(date) : "Sans date";
    const sortValue = date ? date.getTime() : 0;

    if (!map.has(key)) {
      map.set(key, {
        key,
        label,
        sortValue,
        salesTotal: 0,
        expensesTotal: 0,
        result: 0,
        salesItems: [],
        expenseItems: [],
      });
    }

    return map.get(key);
  };

  sales.forEach((item) => {
    const row = ensureMonth(item.date || item.sale_date);
    row.salesTotal += Number(item.amount ?? 0);
    row.salesItems.push(item);
  });

  expenses.forEach((item) => {
    const row = ensureMonth(item.date || item.expense_date);
    row.expensesTotal += Number(item.amount ?? 0);
    row.expenseItems.push(item);
  });

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      result: row.salesTotal - row.expensesTotal,
      salesItems: [...row.salesItems].sort((a, b) => {
        const da = parseDate(a.date || a.sale_date);
        const db = parseDate(b.date || b.sale_date);
        return (db?.getTime?.() || 0) - (da?.getTime?.() || 0);
      }),
      expenseItems: [...row.expenseItems].sort((a, b) => {
        const da = parseDate(a.date || a.expense_date);
        const db = parseDate(b.date || b.expense_date);
        return (db?.getTime?.() || 0) - (da?.getTime?.() || 0);
      }),
    }))
    .sort((a, b) => b.sortValue - a.sortValue);
}