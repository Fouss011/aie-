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

function isShortReaction(question) {
  const q = String(question || "")
    .toLowerCase()
    .trim()
    .replace(/[!?.,;:]/g, "");

  const reactions = [
    "ok",
    "oui",
    "d'accord",
    "dac",
    "good",
    "super",
    "cool",
    "interessant",
    "intéressant",
    "interessant donc",
    "intéressant donc",
    "donc",
    "ah ok",
    "je vois",
    "bien",
    "très bien",
    "tres bien",
    "parfait",
  ];

  return reactions.includes(q) || q.length <= 18;
}

function isClosingMessage(question) {
  const q = String(question || "")
    .toLowerCase()
    .trim()
    .replace(/[!?.,;:]/g, "");

  const closings = [
    "merci",
    "ok merci",
    "d'accord merci",
    "dac merci",
    "c'est bon merci",
    "parfait merci",
    "super merci",
    "merci beaucoup",
    "merci bro",
    "ok c'est bon",
    "c'est bon",
    "D'accord",
    "Daccord",
    "ok",
    "super",
    "merci je vais faire ça",
    "on fait ça",
    "merci, on fait ça",
    "compris",
    "ok compris",
    "D'accord, compris",
    "good",
    "top",
  ];

  return closings.includes(q);
}

function normalizeHistory(history = []) {
  return history
    .filter((item) => item && item.role && item.content)
    .slice(-6)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: String(item.content).slice(0, 1200),
    }));
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

function buildConversationInstruction(question, history) {
  if (isShortReaction(question) && history.length > 0) {
    return `
L'utilisateur vient de faire une réaction courte : "${question}".
Ne répète pas tout le bilan.
Continue naturellement la conversation à partir du dernier échange.
Donne le vrai enseignement principal en 2 à 4 phrases maximum.
    `.trim();
  }

  return `
Réponds directement à la question de l'utilisateur : "${question}".
Si la question demande une analyse, donne une réponse utile, concrète et priorisée.
Si la question demande seulement un chiffre précis, sois bref.
  `.trim();
}

async function askOpenAIWithContext(question, sales, expenses, metrics, history = []) {
  const safeHistory = normalizeHistory(history);
  const prompt = buildBusinessPrompt(question, sales, expenses, metrics);
  const conversationInstruction = buildConversationInstruction(question, safeHistory);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
Tu es Moniva Copilot, un assistant business intelligent pour petites structures.

Ton rôle :
- analyser les recettes, dépenses, activités et résultats
- aider l'utilisateur à décider quoi améliorer
- échanger naturellement, comme un conseiller lucide
- rester concret, prudent et utile

Règles strictes :
- N'invente jamais de chiffre.
- Utilise uniquement les données fournies dans le contexte.
- Ne répète pas les mêmes chiffres si l'utilisateur réagit simplement avec "ok", "intéressant", "donc", "je vois", etc.
- Si l'utilisateur fait une réaction courte, continue la conversation avec une synthèse ou une recommandation claire.
- Si les données sont insuffisantes, dis-le.
- Ne fais pas de promesse de gain.
- Ne donne pas de conseil financier risqué.
- Réponds en français simple.
- Réponse courte : 3 à 6 phrases maximum.
- Pour une question stratégique, structure la réponse ainsi : constat, risque, action prioritaire.
        `.trim(),
      },
      ...safeHistory,
      {
        role: "user",
        content: `
${conversationInstruction}

Voici le contexte chiffré et les données disponibles :

${prompt}
        `.trim(),
      },
    ],
  });

  return (
    completion.choices?.[0]?.message?.content?.trim() ||
    "Je n'ai pas pu générer de réponse."
  );
}

export async function askSalesAssistant(payload, maybeStructureId) {
  const question =
    typeof payload === "object" && payload !== null
      ? payload.question
      : payload;

  const structureId =
    typeof payload === "object" && payload !== null
      ? payload.structureId
      : maybeStructureId;

  const history =
    typeof payload === "object" && payload !== null && Array.isArray(payload.history)
      ? payload.history
      : [];

  if (!question || !String(question).trim()) {
    throw new Error("La question est vide.");
  }

  if (!structureId) {
    throw new Error("structureId est obligatoire pour le chatbot.");
  }

  if (isClosingMessage(question)) {
  return {
    answer: "Avec plaisir. Continue surtout à suivre tes ventes et dépenses régulièrement, c’est comme ça que tu vas garder une vision claire.",
    source: "conversation_closing",
    intent: "closing",
    salesCount: 0,
    expensesCount: 0,
    metrics: null,
  };
}

  const [sales, expenses] = await Promise.all([
    getSalesForPrompt(structureId, 200),
    getExpensesForPrompt(structureId, 200),
  ]);

  const metrics = computeBusinessMetrics(sales, expenses);
  const intent = detectIntent(question);

  const deterministicAnswer = buildDeterministicAnswer(intent, metrics);

  if (deterministicAnswer && !isShortReaction(question)) {
    return {
      answer: deterministicAnswer,
      source: "backend_metrics",
      intent,
      salesCount: sales.length,
      expensesCount: expenses.length,
      metrics,
    };
  }

  const aiAnswer = await askOpenAIWithContext(
    question,
    sales,
    expenses,
    metrics,
    history
  );

  return {
    answer: aiAnswer,
    source: "ai_with_context",
    intent,
    salesCount: sales.length,
    expensesCount: expenses.length,
    metrics,
  };
}