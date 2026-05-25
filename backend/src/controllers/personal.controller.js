import {
  getPersonalDashboard,
  createPersonalTransaction,
  getPersonalTransactions,
  deletePersonalTransaction,
  getPersonalBudgets,
  createPersonalBudget,
  deletePersonalBudget,
  getPersonalRecurringExpenses,
  createPersonalRecurringExpense,
  deletePersonalRecurringExpense,
  getPersonalSavingsGoals,
  createPersonalSavingsGoal,
  updatePersonalSavingsGoal,
  deletePersonalSavingsGoal,
  getPersonalCopilotContext,
} from "../services/personal.service.js";

export async function dashboard(req, res) {
  try {
    const { userId, month } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId requis",
      });
    }

    const data = await getPersonalDashboard(userId, month);

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur dashboard personnel",
    });
  }
}

export async function createTransaction(req, res) {
  try {
    const { userId, ...payload } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "userId requis",
      });
    }

    const transaction = await createPersonalTransaction({
      ...payload,
      user_id: userId,
    });

    res.json(transaction);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur création transaction",
    });
  }
}

export async function transactions(req, res) {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        error: "userId requis",
      });
    }

    const data = await getPersonalTransactions(userId);

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur récupération transactions",
    });
  }
}

export async function removeTransaction(req, res) {
  try {
    const { id } = req.params;

    await deletePersonalTransaction(id);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur suppression transaction",
    });
  }
}

export async function budgets(req, res) {
  try {
    const { userId, month } = req.query;

    if (!userId || !month) {
      return res.status(400).json({
        error: "userId et month requis",
      });
    }

    const data = await getPersonalBudgets(userId, month);

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur récupération budgets",
    });
  }
}

export async function createBudget(req, res) {
  try {
    const { userId, ...payload } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "userId requis",
      });
    }

    const budget = await createPersonalBudget({
      ...payload,
      user_id: userId,
    });

    res.json(budget);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur création budget",
    });
  }
}

export async function removeBudget(req, res) {
  try {
    const { id } = req.params;

    await deletePersonalBudget(id);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur suppression budget",
    });
  }
}

export async function recurringExpenses(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId requis" });
    }

    const data = await getPersonalRecurringExpenses(userId);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur récupération charges fixes" });
  }
}

export async function createRecurringExpense(req, res) {
  try {
    const { userId, ...payload } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId requis" });
    }

    const data = await createPersonalRecurringExpense({
      ...payload,
      user_id: userId,
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur création charge fixe" });
  }
}

export async function removeRecurringExpense(req, res) {
  try {
    const { id } = req.params;

    await deletePersonalRecurringExpense(id);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur suppression charge fixe" });
  }
}

export async function savingsGoals(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId requis",
      });
    }

    const data = await getPersonalSavingsGoals(userId);

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur récupération objectifs épargne",
    });
  }
}

export async function createSavingsGoal(req, res) {
  try {
    const { userId, ...payload } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "userId requis",
      });
    }

    const goal = await createPersonalSavingsGoal({
      ...payload,
      user_id: userId,
    });

    res.json(goal);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur création objectif",
    });
  }
}

export async function updateSavingsGoal(req, res) {
  try {
    const { id } = req.params;

    const goal = await updatePersonalSavingsGoal(id, req.body);

    res.json(goal);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur mise à jour objectif",
    });
  }
}

export async function removeSavingsGoal(req, res) {
  try {
    const { id } = req.params;

    await deletePersonalSavingsGoal(id);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur suppression objectif",
    });
  }
}

export async function personalCopilot(req, res) {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        error: "userId et message requis",
      });
    }

    const context = await getPersonalCopilotContext(userId);

    const lowerMessage = message.toLowerCase().trim();

    const greetings = ["bonjour", "salut", "hello", "bonsoir", "coucou"];
    const thanks = ["merci", "thanks", "ok merci", "c'est bon", "super merci"];
    const positiveReactions = [
      "ok",
      "top",
      "super",
      "cool",
      "d'accord",
      "parfait",
      "bien vu",
      "c'est bien",
      "nickel",
    ];
    const nextActionWords = [
      "que faire",
      "quoi faire",
      "maintenant",
      "prochaine étape",
      "conseil",
      "recommande",
      "améliorer",
    ];

    const balance = Number(context.dashboard?.balance || 0);
    const expenses = Number(context.dashboard?.expenses || 0);
    const income = Number(context.dashboard?.income || 0);

    const transactions = context.transactions || [];
    const budgets = context.budgets || [];
    const recurringExpenses = context.recurringExpenses || [];

    const recurringTotal = recurringExpenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const realBalance = balance - recurringTotal;

    const expenseTransactions = transactions.filter(
      (item) => item.type === "expense"
    );

    const groupedExpenses = {};

    expenseTransactions.forEach((item) => {
      groupedExpenses[item.category] =
        (groupedExpenses[item.category] || 0) + Number(item.amount || 0);
    });

    const sortedExpenses = Object.entries(groupedExpenses).sort(
      (a, b) => b[1] - a[1]
    );

    const topCategory = sortedExpenses[0]?.[0] || null;
    const topAmount = Number(sortedExpenses[0]?.[1] || 0);

    const foodExpenses = expenseTransactions
      .filter((item) => item.category === "Bouffe")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const foodBudget = budgets.find((budget) => budget.category === "Bouffe");
    const foodPlanned = Number(foodBudget?.planned_amount || 0);
    const foodPercent =
      foodPlanned > 0 ? (foodExpenses / foodPlanned) * 100 : 0;

    function globalSummary() {
      const topThree = sortedExpenses
        .slice(0, 3)
        .map(([category, amount]) => `${category} (${Number(amount).toFixed(0)} €)`)
        .join(", ");

      return `Globalement, tu as ${income.toFixed(
        0
      )} € de revenus enregistrés et ${expenses.toFixed(
        0
      )} € de dépenses. Ton reste affiché est d’environ ${balance.toFixed(
        0
      )} €. ${
        recurringTotal > 0
          ? `Après tes charges fixes estimées à ${recurringTotal.toFixed(
              0
            )} €, ton reste réel tourne autour de ${realBalance.toFixed(0)} €.`
          : "Je ne vois pas encore de charges fixes séparées enregistrées, donc je me base sur les opérations du mois."
      } ${
        topThree
          ? `Tes postes les plus lourds sont : ${topThree}.`
          : "Il me faut encore plus de dépenses catégorisées pour mieux repérer les postes lourds."
      }`;
    }

    function actionAdvice() {
      if (topCategory) {
        return `Mon action prioritaire : surveille d’abord ${topCategory}, car c’est ton plus gros poste avec environ ${topAmount.toFixed(
          0
        )} €. Ensuite, fixe une limite claire sur les petites dépenses répétées.`;
      }

      return "Mon action prioritaire : ajoute quelques dépenses avec des catégories précises, puis fixe une limite sur les dépenses variables comme Bouffe, Transport ou Loisirs.";
    }

    if (greetings.some((word) => lowerMessage.includes(word))) {
      return res.json({
        response:
          "Bonjour 👋 Je suis ton copilote financier personnel. Je peux t’aider à analyser ton reste à vivre, tes dépenses, tes budgets, tes charges fixes et ton épargne.",
      });
    }

    if (thanks.some((word) => lowerMessage.includes(word))) {
      return res.json({
        response:
          "Avec plaisir 👌 Garde surtout un œil sur ton reste à vivre et sur les petites dépenses répétées. C’est souvent là que le budget se joue.",
      });
    }

    let response = "";

    if (
      positiveReactions.some((word) => lowerMessage === word) ||
      positiveReactions.some((word) => lowerMessage.includes(word))
    ) {
      response = `${actionAdvice()} Si tu veux, la prochaine étape logique est de regarder tes dépenses par catégorie pour voir où tu peux gagner un peu de marge.`;
    } else if (
      nextActionWords.some((word) => lowerMessage.includes(word))
    ) {
      response = `${globalSummary()} ${actionAdvice()}`;
    } else if (
      lowerMessage.includes("reste") ||
      lowerMessage.includes("reste à vivre") ||
      lowerMessage.includes("combien il me reste")
    ) {
      response = `Il te reste actuellement environ ${balance.toFixed(
        0
      )} € après tes dépenses enregistrées. ${
        recurringTotal > 0
          ? `En tenant compte de tes charges fixes estimées à ${recurringTotal.toFixed(
              0
            )} €, ton reste réel est autour de ${realBalance.toFixed(0)} €.`
          : "Comme tes charges fixes ne sont pas isolées dans le module charges fixes, je me base sur ton reste affiché."
      }`;
    } else if (
      lowerMessage.includes("bouffe") ||
      lowerMessage.includes("manger") ||
      lowerMessage.includes("repas")
    ) {
      if (foodPlanned > 0) {
        response = `Tu as dépensé environ ${foodExpenses.toFixed(
          0
        )} € en Bouffe. Ta limite prévue est de ${foodPlanned.toFixed(
          0
        )} €, donc tu es à environ ${foodPercent.toFixed(0)} %. ${
          foodPercent >= 100
            ? "Oui, là tu as dépassé la limite : il faut ralentir sur cette catégorie aujourd’hui."
            : foodPercent >= 80
            ? "Tu t’approches de la limite, donc prudence sur les prochaines dépenses."
            : "Pour l’instant ça reste correct, mais continue à surveiller."
        }`;
      } else {
        response = `Tu as dépensé environ ${foodExpenses.toFixed(
          0
        )} € en Bouffe récemment. Pour mieux juger si c’est trop, définis une limite Bouffe par jour ou par semaine.`;
      }
    } else if (
      lowerMessage.includes("trop") ||
      lowerMessage.includes("tu trouves") ||
      lowerMessage.includes("abus") ||
      lowerMessage.includes("raisonnable")
    ) {
      if (topCategory) {
        response = `À première vue, le poste le plus lourd est ${topCategory} avec environ ${topAmount.toFixed(
          0
        )} €. Ce n’est pas forcément mauvais si c’est une charge nécessaire, mais si c’est une dépense variable, c’est là qu’il faut agir en premier.`;
      } else {
        response =
          "Je n’ai pas encore assez de dépenses détaillées pour juger finement, mais le bon réflexe est de comparer chaque catégorie à une limite mensuelle ou quotidienne.";
      }
    } else if (
      lowerMessage.includes("budget") ||
      lowerMessage.includes("gestion") ||
      lowerMessage.includes("tu penses quoi") ||
      lowerMessage.includes("avis") ||
      lowerMessage.includes("en général") ||
      lowerMessage.includes("analyse")
    ) {
      response = `${globalSummary()} ${actionAdvice()}`;
    } else if (
      lowerMessage.includes("économiser") ||
      lowerMessage.includes("epargner") ||
      lowerMessage.includes("épargner") ||
      lowerMessage.includes("mettre de côté")
    ) {
      if (realBalance > 0) {
        response = `Tu pourrais potentiellement mettre de côté une partie de ton reste, mais je te conseille de rester prudent. Sur ${realBalance.toFixed(
          0
        )} € disponibles environ, vise d’abord ${Math.max(
          20,
          Math.floor(realBalance * 0.3)
        ).toFixed(0)} € d’épargne, puis ajuste selon tes dépenses réelles.`;
      } else {
        response =
          "Pour l’instant, ton reste réel semble trop serré pour épargner sereinement. Priorité : réduire une dépense variable avant de te fixer un objectif d’épargne.";
      }
    } else if (
      lowerMessage.includes("dépense") ||
      lowerMessage.includes("depense")
    ) {
      if (sortedExpenses.length > 0) {
        response = `Tes plus grosses dépenses actuelles sont : ${sortedExpenses
          .slice(0, 3)
          .map(([category, amount]) => `${category} (${Number(amount).toFixed(0)} €)`)
          .join(", ")}. C’est là qu’il faut regarder en priorité si tu veux améliorer ton budget.`;
      } else {
        response =
          "Je ne vois pas encore assez de dépenses enregistrées pour faire une analyse utile.";
      }
    } else {
      response = `${globalSummary()} ${actionAdvice()}`;
    }

    res.json({
      response,
      context: {
        income,
        expenses,
        balance,
        recurringTotal,
        realBalance,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur Copilot Perso",
    });
  }
}