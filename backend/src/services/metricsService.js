function normalizeDate(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthPrefix(dateStr) {
  return dateStr.slice(0, 7);
}

export function computeBusinessMetrics(sales, expenses) {
  const today = getTodayString();
  const currentMonth = getMonthPrefix(today);

  let salesTotalAmount = 0;
  let salesTodayAmount = 0;
  let salesMonthAmount = 0;
  let salesWithoutClient = 0;
  let latestSale = null;

  let expensesTotalAmount = 0;
  let expensesTodayAmount = 0;
  let expensesMonthAmount = 0;
  let latestExpense = null;

  const productMap = new Map();
  const expenseCategoryMap = new Map();
  const expenseLabelMap = new Map();

  for (const sale of sales) {
    const amount = Number(sale.amount) || 0;
    const saleDate = normalizeDate(sale.sale_date);

    salesTotalAmount += amount;

    if (saleDate === today) {
      salesTodayAmount += amount;
    }

    if (saleDate && saleDate.startsWith(currentMonth)) {
      salesMonthAmount += amount;
    }

    if (!sale.client_name || !String(sale.client_name).trim()) {
      salesWithoutClient += 1;
    }

    const productStats = productMap.get(sale.product) || {
      count: 0,
      totalAmount: 0,
    };

    productStats.count += 1;
    productStats.totalAmount += amount;
    productMap.set(sale.product, productStats);

    if (!latestSale) {
      latestSale = sale;
    }
  }

  for (const expense of expenses) {
    const amount = Number(expense.amount) || 0;
    const expenseDate = normalizeDate(expense.expense_date);

    expensesTotalAmount += amount;

    if (expenseDate === today) {
      expensesTodayAmount += amount;
    }

    if (expenseDate && expenseDate.startsWith(currentMonth)) {
      expensesMonthAmount += amount;
    }

    const categoryKey = expense.category || "Non catégorisé";
    const labelKey = expense.label || "Sans libellé";

    expenseCategoryMap.set(
      categoryKey,
      (expenseCategoryMap.get(categoryKey) || 0) + amount
    );

    expenseLabelMap.set(
      labelKey,
      (expenseLabelMap.get(labelKey) || 0) + amount
    );

    if (!latestExpense) {
      latestExpense = expense;
    }
  }

  let topProductByCount = null;
  let topProductByAmount = null;

  for (const [product, stats] of productMap.entries()) {
    if (!topProductByCount || stats.count > topProductByCount.count) {
      topProductByCount = { product, count: stats.count };
    }

    if (
      !topProductByAmount ||
      stats.totalAmount > topProductByAmount.totalAmount
    ) {
      topProductByAmount = { product, totalAmount: stats.totalAmount };
    }
  }

  let topExpenseCategory = null;
  for (const [category, totalAmount] of expenseCategoryMap.entries()) {
    if (!topExpenseCategory || totalAmount > topExpenseCategory.totalAmount) {
      topExpenseCategory = { category, totalAmount };
    }
  }

  let topExpenseLabel = null;
  for (const [label, totalAmount] of expenseLabelMap.entries()) {
    if (!topExpenseLabel || totalAmount > topExpenseLabel.totalAmount) {
      topExpenseLabel = { label, totalAmount };
    }
  }

  const profitToday = salesTodayAmount - expensesTodayAmount;
  const profitMonth = salesMonthAmount - expensesMonthAmount;
  const profitTotal = salesTotalAmount - expensesTotalAmount;

  return {
    today,
    currentMonth,

    salesCount: sales.length,
    salesTotalAmount,
    salesTodayAmount,
    salesMonthAmount,
    salesWithoutClient,
    latestSale,
    topProductByCount,
    topProductByAmount,

    expensesCount: expenses.length,
    expensesTotalAmount,
    expensesTodayAmount,
    expensesMonthAmount,
    latestExpense,
    topExpenseCategory,
    topExpenseLabel,

    profitToday,
    profitMonth,
    profitTotal,
  };
}