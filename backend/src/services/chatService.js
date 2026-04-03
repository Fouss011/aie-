import OpenAI from "openai";
import { env } from "../config/env.js";
import { getSalesForPrompt } from "./salesService.js";
import { getExpensesForPrompt } from "./expensesService.js";
import { computeBusinessMetrics } from "./metricsService.js";
import { detectIntent } from "./intentService.js";
import { buildBusinessPrompt } from "./promptService.js";

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
});

function formatAmount(value) {
  return new Intl.NumberFormat("fr-FR").format(Number(value || 0));
}

function buildDeterministicAnswer(intent, metrics) {
  switch (intent) {
    case "sales_today":
      return `Aujourd’hui (${metrics.today}), le total des ventes est de ${formatAmount(metrics.salesTodayAmount)} FCFA.`;

    case "expenses_today":
      return `Aujourd’hui (${metrics.today}), le total des dépenses est de ${formatAmount(metrics.expensesTodayAmount)} FCFA.`;

    case "profit_today":
      return `Aujourd’hui (${metrics.today}), le résultat simple est de ${formatAmount(metrics.profitToday)} FCFA (ventes - dépenses).`;

    case "profit_month":
      return `Pour le mois en cours (${metrics.currentMonth}), le résultat simple est de ${formatAmount(metrics.profitMonth)} FCFA (ventes - dépenses).`;

    case "sales_month":
      return `Pour le mois en cours (${metrics.currentMonth}), le total des ventes est de ${formatAmount(metrics.salesMonthAmount)} FCFA.`;

    case "sales_total":
      return `Le total cumulé des ventes enregistrées est de ${formatAmount(metrics.salesTotalAmount)} FCFA.`;

    case "expenses_total":
      return `Le total cumulé des dépenses enregistrées est de ${formatAmount(metrics.expensesTotalAmount)} FCFA.`;

    case "top_product":
      if (!metrics.topProductByCount) {
        return "Je n’ai pas assez de données pour identifier le produit le plus vendu.";
      }
      return `Le produit le plus vendu en nombre d’occurrences est "${metrics.topProductByCount.product}" avec ${metrics.topProductByCount.count} vente(s).`;

    case "top_expense_label":
      if (!metrics.topExpenseLabel) {
        return "Je n’ai pas assez de données pour identifier la plus grosse dépense.";
      }
      return `La dépense la plus élevée est "${metrics.topExpenseLabel.label}" avec un total de ${formatAmount(metrics.topExpenseLabel.totalAmount)} FCFA.`;

    case "top_expense_category":
      if (!metrics.topExpenseCategory) {
        return "Je n’ai pas assez de données pour identifier la catégorie de dépense dominante.";
      }
      return `La catégorie de dépense la plus élevée est "${metrics.topExpenseCategory.category}" avec ${formatAmount(metrics.topExpenseCategory.totalAmount)} FCFA.`;

    case "latest_sale":
      if (!metrics.latestSale) {
        return "Aucune vente n’est enregistrée pour le moment.";
      }
      return `La dernière vente enregistrée concerne "${metrics.latestSale.product}" pour ${formatAmount(metrics.latestSale.amount)} FCFA à la date du ${metrics.latestSale.sale_date}.`;

    case "latest_expense":
      if (!metrics.latestExpense) {
        return "Aucune dépense n’est enregistrée pour le moment.";
      }
      return `La dernière dépense enregistrée est "${metrics.latestExpense.label}" pour ${formatAmount(metrics.latestExpense.amount)} FCFA à la date du ${metrics.latestExpense.expense_date}.`;

    case "sales_without_client":
      return `Il y a ${metrics.salesWithoutClient} vente(s) sans nom de client renseigné.`;

    case "sales_count":
      return `Il y a ${metrics.salesCount} vente(s) enregistrée(s) au total.`;

    case "expenses_count":
      return `Il y a ${metrics.expensesCount} dépense(s) enregistrée(s) au total.`;

    default:
      return null;
  }
}

async function askOpenAIWithContext(question, sales, expenses, metrics) {
  const prompt = buildBusinessPrompt(question, sales, expenses, metrics);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "Tu es un assistant business fiable. Tu utilises uniquement les données et métriques fournies. N’invente rien.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return (
    completion.choices?.[0]?.message?.content?.trim() ||
    "Je n'ai pas pu générer de réponse."
  );
}

export async function askSalesAssistant(question, structureId) {
  if (!question || !question.trim()) {
    throw new Error("La question est vide.");
  }

  if (!structureId) {
    throw new Error("structureId est obligatoire pour le chatbot.");
  }

  const [sales, expenses] = await Promise.all([
    getSalesForPrompt(structureId, 200),
    getExpensesForPrompt(structureId, 200),
  ]);

  const metrics = computeBusinessMetrics(sales, expenses);
  const intent = detectIntent(question);

  const deterministicAnswer = buildDeterministicAnswer(intent, metrics);

  if (deterministicAnswer) {
    return {
      answer: deterministicAnswer,
      source: "backend_metrics",
      intent,
      salesCount: sales.length,
      expensesCount: expenses.length,
      metrics,
    };
  }

  const aiAnswer = await askOpenAIWithContext(question, sales, expenses, metrics);

  return {
    answer: aiAnswer,
    source: "ai_with_context",
    intent,
    salesCount: sales.length,
    expensesCount: expenses.length,
    metrics,
  };
}