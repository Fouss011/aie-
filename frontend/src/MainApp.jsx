import { useMemo, useState } from "react";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ChargesPage from "./pages/ChargesPage";
import ImportsPage from "./pages/ImportsPage";
import DocumentsPage from "./pages/DocumentsPage";
import NotesPage from "./pages/NotesPage";
import { useAuth } from "./context/AuthProvider";

export default function MainApp() {
  const { activeStructure } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  const structureLabel = activeStructure?.name || "Ma structure";

  const MENU_ITEMS = useMemo(
    () => [
      { key: "dashboard", label: structureLabel },
      { key: "activities", label: "Activités" },
      { key: "charges", label: "Charges" },
      { key: "imports", label: "Imports" },
      { key: "documents", label: "Justificatifs" },
      { key: "notes", label: "Notes" },
    ],
    [structureLabel]
  );

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "activities":
        return <ActivitiesPage />;
      case "charges":
        return <ChargesPage />;
      case "imports":
        return <ImportsPage />;
      case "documents":
        return <DocumentsPage />;
      case "notes":
        return <NotesPage />;
      default:
        return <DashboardPage />;
    }
  }

  return (
    <AppShell
      activePage={activePage}
      onNavigate={setActivePage}
      menuItems={MENU_ITEMS}
    >
      {renderPage()}
    </AppShell>
  );
}