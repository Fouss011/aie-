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

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[!?.,;:]/g, "")
    .replace(/\s+/g, " ");
}

function classifyUserMessage(question) {
  const q = normalizeText(question);

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
    "merci je vais faire ça",
    "merci je vais faire ca",
  ];

  const neutral = [
    "ok",
    "oui",
    "d'accord",
    "daccord",
    "dac",
    "compris",
    "ok compris",
    "good",
    "top",
    "super",
    "parfait",
    "bien",
    "très bien",
    "tres bien",
    "je vois",
    "ah ok",
    "on fait ça",
    "on fait ca",
  ];

  const followup = [
    "donc",
    "du coup",
    "alors",
    "interessant",
    "intéressant",
    "interessant donc",
    "intéressant donc",
    "et donc",
    "ok donc",
  ];
  const greetings = [
    "bonjour",
    "salut",
    "bonsoir",
    "hello",
    "coucou",
    "bjr",
  ];

  if (greetings.includes(q)) return "greeting";
  if (closings.includes(q)) return "closing";
  if (followup.includes(q)) return "followup";
  if (neutral.includes(q)) return "neutral";

  if (q.length <= 14) return "neutral";

  return "question";
}

function isShortReaction(question) {
  const type = classifyUserMessage(question);
  return type === "neutral" || type === "followup";
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

function buildConversationInstruction(question, history, messageType) {
  if (messageType === "followup" && history.length > 0) {
    return `
L'utilisateur réagit ou demande une suite : "${question}".
Ne recommence pas le bilan.
Ne répète pas les chiffres déjà donnés.
Donne uniquement l'idée la plus importante en 2 à 3 phrases.
    `.trim();
  }

  return `
Réponds directement à la question de l'utilisateur : "${question}".
Si c’est une analyse, donne :
1. un constat clair
2. un seul point prioritaire
3. une action simple
Si c’est une question exploratoire, conseille prudemment sans inventer de chiffres.
  `.trim();
}

async function askOpenAIWithContext(
  question,
  sales,
  expenses,
  metrics,
  history = [],
  messageType = "question"
) {
  const safeHistory = normalizeHistory(history);
  const prompt = buildBusinessPrompt(question, sales, expenses, metrics);
  const conversationInstruction = buildConversationInstruction(
    question,
    safeHistory,
    messageType
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
Tu es Monyva Copilot, un assistant business intelligent pour petites structures.

Ton rôle :
- analyser les recettes, dépenses, activités et résultats
- aider l'utilisateur à décider quoi améliorer
- échanger naturellement, comme un conseiller lucide
- rester concret, prudent et utile

Règles strictes :
- N'invente jamais de chiffre.
- Utilise uniquement les données fournies dans le contexte.
- Ne répète pas les mêmes chiffres si l'utilisateur réagit simplement avec "ok", "intéressant", "donc", "je vois", etc.
- Si l'utilisateur fait une réaction courte, continue avec une seule idée utile, pas un nouveau bilan.
- Si l'utilisateur dit merci, ok merci, d'accord merci, ou indique que c'est compris, ne relance pas l'analyse.
- Si les données sont insuffisantes, dis-le clairement.
- Ne fais pas de promesse de gain.
- Ne donne pas de conseil financier risqué.
- Réponds en français simple.
- Réponse courte : 2 à 5 phrases maximum.
- Pour une question stratégique, réponds en : constat, risque, action prioritaire.
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
    typeof payload === "object" && payload !== null ? payload.question : payload;

  const structureId =
    typeof payload === "object" && payload !== null
      ? payload.structureId
      : maybeStructureId;

  const history =
    typeof payload === "object" &&
    payload !== null &&
    Array.isArray(payload.history)
      ? payload.history
      : [];

  if (!question || !String(question).trim()) {
    throw new Error("La question est vide.");
  }

  if (!structureId) {
    throw new Error("structureId est obligatoire pour le chatbot.");
  }

  const messageType = classifyUserMessage(question);
  if (messageType === "greeting") {
    return {
      answer:
        "Bonjour 👋 Je suis là. Tu veux qu’on regarde tes ventes, tes dépenses ou l’état de ta journée ?",
      source: "conversation_greeting",
      intent: "greeting",
      salesCount: 0,
      expensesCount: 0,
      metrics: null,
    };
  }

  if (messageType === "closing") {
    return {
      answer: "Avec plaisir 👍",
      source: "conversation_closing",
      intent: "closing",
      salesCount: 0,
      expensesCount: 0,
      metrics: null,
    };
  }

  if (messageType === "neutral") {
    return {
      answer: "",
      source: "conversation_neutral",
      intent: "neutral",
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
    history,
    messageType
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