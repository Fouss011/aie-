import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ChargesPage from "./pages/ChargesPage";
import ImportsPage from "./pages/ImportsPage";
import DocumentsPage from "./pages/DocumentsPage";
import NotesPage from "./pages/NotesPage";

const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "activities", label: "Activités" },
  { key: "charges", label: "Charges" },
  { key: "imports", label: "Imports" },
  { key: "documents", label: "Justificatifs" },
  { key: "notes", label: "Notes" },
];

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

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