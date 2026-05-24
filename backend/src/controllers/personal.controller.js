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

    const lowerMessage = message.toLowerCase();
    const greetings = ["bonjour", "salut", "hello", "bonsoir", "coucou"];
    const thanks = ["merci", "thanks", "ok merci", "c'est bon", "super merci"];

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

    let response =
      "Je n’ai pas encore assez d’informations pour répondre.";

    const balance = Number(context.dashboard?.balance || 0);
    const expenses = Number(context.dashboard?.expenses || 0);
    const income = Number(context.dashboard?.income || 0);

    const recurringTotal = context.recurringExpenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    if (
      lowerMessage.includes("reste") ||
      lowerMessage.includes("reste à vivre")
    ) {
      response = `Il te reste actuellement environ ${balance.toFixed(
        0
      )} € après tes dépenses enregistrées. En incluant tes charges fixes estimées à ${recurringTotal.toFixed(
        0
      )} €, ton reste réel devient environ ${(balance - recurringTotal).toFixed(
        0
      )} €.`;
    } else if (
      lowerMessage.includes("bouffe") ||
      lowerMessage.includes("manger")
    ) {
      const foodExpenses = context.transactions
        .filter((item) => item.category === "Bouffe")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      response = `Tu as dépensé environ ${foodExpenses.toFixed(
        0
      )} € dans la catégorie Bouffe récemment. Vérifie si cela reste cohérent avec ton budget quotidien.`;
    } else if (
      lowerMessage.includes("économiser") ||
      lowerMessage.includes("epargner")
    ) {
      const possibleSavings = balance - recurringTotal;

      if (possibleSavings > 0) {
        response = `Tu pourrais potentiellement mettre de côté environ ${possibleSavings.toFixed(
          0
        )} € ce mois-ci si tes dépenses restent stables.`;
      } else {
        response =
          "Tes charges fixes et dépenses actuelles semblent déjà absorber la majorité de tes revenus.";
      }
    } else if (
      lowerMessage.includes("dépense") ||
      lowerMessage.includes("depense")
    ) {
      const grouped = {};

      context.transactions.forEach((item) => {
        if (item.type !== "expense") return;

        grouped[item.category] =
          (grouped[item.category] || 0) + Number(item.amount || 0);
      });

      const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

      if (sorted.length > 0) {
        response = `Tes plus grosses dépenses actuelles sont : ${sorted
          .slice(0, 3)
          .map(([category, amount]) => `${category} (${amount.toFixed(0)} €)`)
          .join(", ")}.`;
      }
    }

    res.json({
      response,
      context: {
        income,
        expenses,
        balance,
        recurringTotal,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur Copilot Perso",
    });
  }
}