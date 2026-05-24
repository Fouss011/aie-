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

    if (greetings.some((word) => lowerMessage.includes(word))) {
      return res.json({
        response:
          "Bonjour 👋 Je suis ton copilote financier personnel. Je peux t’aider à analyser ton reste à vivre, tes dépenses, tes budgets, tes charges fixes et ton épargne.",
      });
    }

    if (thanks.some((word) => lowerMessage.includes(word))) {
      return res.json({
        response:
          "Avec plaisir 👌 Je reste là pour t’aider à garder le contrôle sur ton budget personnel.",
      });
    }

    let response = "";

    if (
      lowerMessage.includes("reste") ||
      lowerMessage.includes("reste à vivre") ||
      lowerMessage.includes("combien il me reste")
    ) {
      response = `Il te reste actuellement environ ${balance.toFixed(
        0
      )} € après tes dépenses enregistrées. En tenant compte de tes charges fixes estimées à ${recurringTotal.toFixed(
        0
      )} €, ton reste réel est autour de ${realBalance.toFixed(
        0
      )} €.`;
    } else if (
      lowerMessage.includes("bouffe") ||
      lowerMessage.includes("manger") ||
      lowerMessage.includes("repas")
    ) {
      const foodExpenses = expenseTransactions
        .filter((item) => item.category === "Bouffe")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const foodBudget = budgets.find((budget) => budget.category === "Bouffe");
      const planned = Number(foodBudget?.planned_amount || 0);

      if (planned > 0) {
        const percent = (foodExpenses / planned) * 100;

        response = `Tu as dépensé environ ${foodExpenses.toFixed(
          0
        )} € en Bouffe. Ton budget prévu est de ${planned.toFixed(
          0
        )} €, donc tu es à environ ${percent.toFixed(
          0
        )} %. ${
          percent >= 100
            ? "Oui, là tu as dépassé la limite : il faut ralentir sur cette catégorie aujourd’hui."
            : percent >= 80
            ? "Tu t’approches de la limite, donc prudence sur les prochaines dépenses."
            : "Pour l’instant ça reste correct, mais continue à surveiller."
        }`;
      } else {
        response = `Tu as dépensé environ ${foodExpenses.toFixed(
          0
        )} € en Bouffe récemment. Je te conseille de définir une limite pour cette catégorie afin que je puisse mieux juger si c’est trop ou pas.`;
      }
    } else if (
      lowerMessage.includes("tu trouves") ||
      lowerMessage.includes("c'est trop") ||
      lowerMessage.includes("est-ce trop") ||
      lowerMessage.includes("trop dépens")
    ) {
      if (sortedExpenses.length > 0) {
        const [topCategory, topAmount] = sortedExpenses[0];

        response = `À première vue, ta dépense la plus lourde est ${topCategory} avec environ ${topAmount.toFixed(
          0
        )} €. Ce n’est pas forcément “trop”, mais ça mérite surveillance. Le bon réflexe est de comparer cette catégorie à une limite claire et de réduire les petites dépenses répétées.`;
      } else {
        response =
          "Je ne vois pas encore assez de dépenses enregistrées pour juger correctement. Ajoute quelques opérations et je pourrai te donner un avis plus précis.";
      }
    } else if (
      lowerMessage.includes("budget") ||
      lowerMessage.includes("gestion") ||
      lowerMessage.includes("tu penses quoi") ||
      lowerMessage.includes("avis") ||
      lowerMessage.includes("en général")
    ) {
      const topThree = sortedExpenses
        .slice(0, 3)
        .map(([category, amount]) => `${category} (${amount.toFixed(0)} €)`)
        .join(", ");

      response = `Globalement, tu as ${income.toFixed(
        0
      )} € de revenus enregistrés et ${expenses.toFixed(
        0
      )} € de dépenses, soit un reste affiché de ${balance.toFixed(
        0
      )} €. Après charges fixes estimées à ${recurringTotal.toFixed(
        0
      )} €, ton reste réel est autour de ${realBalance.toFixed(
        0
      )} €. ${
        topThree
          ? `Tes plus gros postes sont : ${topThree}.`
          : "Je n’ai pas encore assez de catégories de dépenses pour identifier les postes les plus lourds."
      } Mon conseil : fixe des limites sur les catégories variables et surveille surtout les dépenses répétées du quotidien.`;
    } else if (
      lowerMessage.includes("économiser") ||
      lowerMessage.includes("epargner") ||
      lowerMessage.includes("épargner") ||
      lowerMessage.includes("mettre de côté")
    ) {
      if (realBalance > 0) {
        response = `Tu pourrais potentiellement mettre de côté environ ${realBalance.toFixed(
          0
        )} € ce mois-ci si tes dépenses restent stables. Pour rester prudent, commence par viser une épargne plus petite, par exemple ${Math.max(
          20,
          Math.floor(realBalance * 0.3)
        ).toFixed(0)} €, puis augmente progressivement.`;
      } else {
        response =
          "Pour l’instant, tes charges fixes et dépenses semblent absorber ton reste disponible. Avant d’épargner, il faut réduire une ou deux dépenses variables.";
      }
    } else if (
      lowerMessage.includes("dépense") ||
      lowerMessage.includes("depense")
    ) {
      if (sortedExpenses.length > 0) {
        response = `Tes plus grosses dépenses actuelles sont : ${sortedExpenses
          .slice(0, 3)
          .map(([category, amount]) => `${category} (${amount.toFixed(0)} €)`)
          .join(", ")}. C’est là qu’il faut regarder en priorité si tu veux améliorer ton budget.`;
      } else {
        response =
          "Je ne vois pas encore assez de dépenses enregistrées pour faire une analyse utile.";
      }
    } else {
      response = `Je peux déjà te dire ceci : tu as ${income.toFixed(
        0
      )} € de revenus, ${expenses.toFixed(
        0
      )} € de dépenses et environ ${balance.toFixed(
        0
      )} € de reste affiché. Pose-moi une question plus précise sur ton reste à vivre, tes dépenses, la bouffe, l’épargne ou ton budget global.`;
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