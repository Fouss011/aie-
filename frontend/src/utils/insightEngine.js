export function generateInsight({ salesToday, expensesToday, monthSales, monthExpenses }) {
  const profitToday = salesToday - expensesToday;
  const profitMonth = monthSales - monthExpenses;

  // 🟢 Cas parfait
  if (salesToday > 0 && expensesToday === 0) {
    return {
      type: "success",
      message: "Excellente journée : 100% de bénéfice. Continue comme ça 🔥",
    };
  }

  // 🔴 Danger
  if (expensesToday > salesToday) {
    return {
      type: "danger",
      message: "Attention : tu dépenses plus que tu ne gagnes aujourd’hui ⚠️",
    };
  }

  // 🟡 Moyen
  if (profitToday > 0) {
    return {
      type: "warning",
      message: "Bonne performance, mais tu peux encore optimiser tes charges.",
    };
  }

  // 📉 Rien fait
  if (salesToday === 0 && expensesToday === 0) {
    return {
      type: "info",
      message: "Aucune activité aujourd’hui. Lance une action pour générer du revenu 🚀",
    };
  }

  // 📈 Projection simple
  if (profitMonth > 0) {
    return {
      type: "success",
      message: `Tu es en positif ce mois-ci (+${profitMonth} FCFA). Continue 🔥`,
    };
  }

  return {
    type: "info",
    message: "Analyse en cours…",
  };
}