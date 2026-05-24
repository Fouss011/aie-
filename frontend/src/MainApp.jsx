import { useMemo, useState } from "react";
import AppShell from "./components/layout/AppShell";

import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ChargesPage from "./pages/ChargesPage";
import ImportsPage from "./pages/ImportsPage";
import DocumentsPage from "./pages/DocumentsPage";
import NotesPage from "./pages/NotesPage";

import PersonalDashboardPage from "./perso/pages/PersonalDashboardPage";
import PersonalTransactionsPage from "./perso/pages/PersonalTransactionsPage";
import PersonalBudgetsPage from "./perso/pages/PersonalBudgetsPage";
import PersonalRecurringExpensesPage from "./perso/pages/PersonalRecurringExpensesPage";
import PersonalSavingsPage from "./perso/pages/PersonalSavingsPage";

import { useAuth } from "./context/AuthProvider";

export default function MainApp() {
  const { activeStructure } = useAuth();

  const [universe, setUniverse] = useState(() => {
    return localStorage.getItem("monyva_universe") || "business";
  });

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("monyva_active_page") || "dashboard";
  });

  const structureLabel = activeStructure?.name || "Ma structure";

  const MENU_ITEMS = useMemo(
    () => [
      { key: "dashboard", label: structureLabel },
      { key: "activities", label: "Recettes" },
      { key: "charges", label: "Dépenses" },
      { key: "imports", label: "Imports" },
      { key: "documents", label: "Justificatifs" },
      { key: "notes", label: "Notes" },
    ],
    [structureLabel]
  );

  const PERSONAL_MENU_ITEMS = useMemo(
    () => [
      { key: "personal-dashboard", label: "Vue perso" },
      { key: "personal-add-operation", label: "Ajouter opération" },
      { key: "personal-transactions", label: "Transactions" },
      { key: "personal-budgets", label: "Budgets" },
      { key: "personal-recurring", label: "Charges fixes" },
      { key: "personal-savings", label: "Épargne" },
      
    ],
    []
  );

  const currentMenuItems =
    universe === "business" ? MENU_ITEMS : PERSONAL_MENU_ITEMS;

  function handleNavigate(page) {
  setActivePage(page);
  localStorage.setItem("monyva_active_page", page);
}

  function switchUniverse(nextUniverse) {
    setUniverse(nextUniverse);
localStorage.setItem("monyva_universe", nextUniverse);

const nextPage =
  nextUniverse === "business" ? "dashboard" : "personal-dashboard";

setActivePage(nextPage);
localStorage.setItem("monyva_active_page", nextPage);
  }

  function renderPage() {
  if (universe === "personal") {
    switch (activePage) {
      case "personal-dashboard":
        return <PersonalDashboardPage />;

      case "personal-add-operation":
        return <PersonalDashboardPage focusForm />;

      case "personal-transactions":
        return <PersonalTransactionsPage />;

      case "personal-budgets":
        return <PersonalBudgetsPage />;

      case "personal-recurring":
        return <PersonalRecurringExpensesPage />;

      case "personal-savings":
        return <PersonalSavingsPage />;

      default:
        return <PersonalDashboardPage />;
    }
  }

  switch (activePage) {
    case "dashboard":
      return <DashboardPage activeStructure={activeStructure} />;

    case "activities":
      return <ActivitiesPage />;

    case "charges":
      return <ChargesPage />;

    case "imports":
      return <ImportsPage />;

    case "documents":
      return <DocumentsPage />;

    case "notes":
      return <NotesPage activeStructure={activeStructure} />;

    default:
      return <DashboardPage activeStructure={activeStructure} />;
  }
}

  return (
    <AppShell
      activePage={activePage}
      onNavigate={handleNavigate}
      menuItems={currentMenuItems}
      universe={universe}
      onSwitchUniverse={switchUniverse}
    >
      {renderPage()}
    </AppShell>
  );
}