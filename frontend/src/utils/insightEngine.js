function safeAmount(value) {
  return Number(value || 0);
}

function compactMoney(value) {
  return `${new Intl.NumberFormat("fr-FR").format(
    Math.round(safeAmount(value))
  )} FCFA`;
}

function normalizeDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function getCurrentMonthPrefix() {
  return new Date().toISOString().slice(0, 10).slice(0, 7);
}

function getLabel(item) {
  return (
    item?.label ||
    item?.category ||
    item?.product ||
    item?.activity ||
    "Non classé"
  );
}

function getTopItem(items = []) {
  const totals = new Map();

  items.forEach((item) => {
    const label = getLabel(item);
    totals.set(label, (totals.get(label) || 0) + safeAmount(item.amount));
  });

  return (
    [...totals.entries()]
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total)[0] || null
  );
}

export function generateInsight({
  salesToday = 0,
  expensesToday = 0,
  monthSales = 0,
  monthExpenses = 0,
  sales = [],
  expenses = [],
} = {}) {
  const currentMonth = getCurrentMonthPrefix();

  const monthlySales = sales.filter((item) =>
    normalizeDate(item.sale_date || item.date).startsWith(currentMonth)
  );

  const monthlyExpenses = expenses.filter((item) =>
    normalizeDate(item.expense_date || item.date).startsWith(currentMonth)
  );

  const profitToday = safeAmount(salesToday) - safeAmount(expensesToday);
  const profitMonth = safeAmount(monthSales) - safeAmount(monthExpenses);

  const expenseRatio =
    safeAmount(monthSales) > 0
      ? (safeAmount(monthExpenses) / safeAmount(monthSales)) * 100
      : 0;

  const topSale = getTopItem(monthlySales);
  const topExpense = getTopItem(monthlyExpenses);

  const todayHasData = safeAmount(salesToday) > 0 || safeAmount(expensesToday) > 0;

  const todayExpenseTooHigh =
    safeAmount(expensesToday) > safeAmount(salesToday) &&
    safeAmount(expensesToday) > 0;

  if (!safeAmount(monthSales) && !safeAmount(monthExpenses) && !todayHasData) {
    return {
      type: "info",
      message: "Ajoute quelques recettes et charges pour lancer l’analyse.",
      detail:
        "Monyva devient utile dès qu’il peut comparer ce qui entre, ce qui sort et ce qui reste.",
      action: "Commence par saisir les opérations du jour.",
      question: "Que dois-je saisir en priorité ?",
    };
  }

  if (todayExpenseTooHigh) {
    return {
      type: "danger",
      message: "Aujourd’hui, les charges dépassent les recettes.",
      detail: `Écart du jour : ${compactMoney(
        Math.abs(profitToday)
      )}. Ce n’est pas grave si c’est ponctuel, mais il faut identifier la charge qui pèse le plus.`,
      action: topExpense
        ? `Vérifie d’abord : ${topExpense.label}.`
        : "Vérifie la dépense la plus récente.",
      question: "Pourquoi mon résultat baisse ?",
    };
  }

  if (expenseRatio >= 60) {
    return {
      type: "warning",
      message: "Les charges prennent trop de place ce mois-ci.",
      detail: `Elles représentent environ ${Math.round(
        expenseRatio
      )}% des recettes mensuelles. La priorité est de réduire ou justifier les grosses sorties.`,
      action: topExpense
        ? `Premier point à contrôler : ${topExpense.label}.`
        : "Contrôle les charges les plus élevées.",
      question: "Quelles dépenses dois-je réduire ?",
    };
  }

  if (profitMonth > 0 && topSale) {
    return {
      type: "success",
      message: `${topSale.label} tire ton activité vers le haut.`,
      detail: `Le mois reste positif avec ${compactMoney(
        profitMonth
      )} de résultat. L’objectif est de renforcer ce qui marche sans laisser les charges dériver.`,
      action: "Protège cette activité et surveille les dépenses associées.",
      question: "Quelle activité rapporte le plus ?",
    };
  }

  if (profitMonth > 0) {
    return {
      type: "success",
      message: "Le mois est positif, garde le rythme.",
      detail: `Résultat actuel : ${compactMoney(
        profitMonth
      )}. L’enjeu maintenant est de transformer ce bon niveau en habitude.`,
      action: "Compare chaque semaine les recettes et les charges.",
      question: "Que dois-je améliorer cette semaine ?",
    };
  }

  if (safeAmount(monthSales) > 0 && profitMonth <= 0) {
    return {
      type: "danger",
      message: "Le chiffre d’affaires existe, mais le résultat reste fragile.",
      detail:
        "Les recettes ne suffisent pas encore à couvrir confortablement les charges du mois.",
      action: topExpense
        ? `Commence par analyser : ${topExpense.label}.`
        : "Repère la charge qui revient le plus souvent.",
      question: "Qu’est-ce qui bloque ma rentabilité ?",
    };
  }

  return {
    type: "info",
    message: "Monyva suit ton activité et prépare l’analyse.",
    detail:
      "Plus les données sont régulières, plus les décisions proposées seront utiles.",
    action: "Continue à saisir les recettes et les charges importantes.",
    question: "Que dois-je surveiller ce mois-ci ?",
  };
}