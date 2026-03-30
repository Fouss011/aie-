export function buildBusinessPrompt(question, sales, expenses, metrics) {
  const salesText = sales.length
    ? sales
        .map(
          (item) =>
            `- vente | date: ${item.sale_date}, produit: ${item.product}, montant: ${item.amount}, client: ${item.client_name || "N/A"}`
        )
        .join("\n")
    : "Aucune vente disponible.";

  const expensesText = expenses.length
    ? expenses
        .map(
          (item) =>
            `- dépense | date: ${item.expense_date}, libellé: ${item.label}, catégorie: ${item.category || "N/A"}, montant: ${item.amount}`
        )
        .join("\n")
    : "Aucune dépense disponible.";

  const metricsText = `
Métriques calculées côté backend :
- date du jour: ${metrics.today}
- mois courant: ${metrics.currentMonth}

Ventes :
- nombre total de ventes: ${metrics.salesCount}
- total cumulé des ventes: ${metrics.salesTotalAmount}
- total des ventes du jour: ${metrics.salesTodayAmount}
- total des ventes du mois: ${metrics.salesMonthAmount}
- ventes sans client: ${metrics.salesWithoutClient}
- dernière vente: ${
    metrics.latestSale
      ? `${metrics.latestSale.product}, ${metrics.latestSale.amount} FCFA, ${metrics.latestSale.sale_date}`
      : "aucune"
  }
- produit le plus vendu (par nombre): ${
    metrics.topProductByCount
      ? `${metrics.topProductByCount.product} (${metrics.topProductByCount.count})`
      : "aucun"
  }
- produit le plus vendu (par montant): ${
    metrics.topProductByAmount
      ? `${metrics.topProductByAmount.product} (${metrics.topProductByAmount.totalAmount})`
      : "aucun"
  }

Dépenses :
- nombre total de dépenses: ${metrics.expensesCount}
- total cumulé des dépenses: ${metrics.expensesTotalAmount}
- total des dépenses du jour: ${metrics.expensesTodayAmount}
- total des dépenses du mois: ${metrics.expensesMonthAmount}
- dernière dépense: ${
    metrics.latestExpense
      ? `${metrics.latestExpense.label}, ${metrics.latestExpense.amount} FCFA, ${metrics.latestExpense.expense_date}`
      : "aucune"
  }
- catégorie de dépense la plus élevée: ${
    metrics.topExpenseCategory
      ? `${metrics.topExpenseCategory.category} (${metrics.topExpenseCategory.totalAmount})`
      : "aucune"
  }
- libellé de dépense le plus élevé: ${
    metrics.topExpenseLabel
      ? `${metrics.topExpenseLabel.label} (${metrics.topExpenseLabel.totalAmount})`
      : "aucun"
  }

Résultats :
- bénéfice du jour: ${metrics.profitToday}
- bénéfice du mois: ${metrics.profitMonth}
- bénéfice cumulé: ${metrics.profitTotal}
`;

  return `
Tu es un assistant d'entreprise.
Tu réponds uniquement à partir des données et métriques fournies.
N'invente jamais de chiffres.
Si l'information n'est pas présente, dis clairement qu'elle n'est pas disponible.

${metricsText}

Données de ventes détaillées :
${salesText}

Données de dépenses détaillées :
${expensesText}

Question utilisateur :
${question}

Consignes :
- Réponds en français simple.
- Sois clair, utile et concis.
- Appuie-toi d'abord sur les métriques backend.
- N'invente aucune donnée absente.
- Si la question dépasse les données disponibles, dis-le explicitement.
`;
}