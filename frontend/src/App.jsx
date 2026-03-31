import { AuthProvider } from "./context/AuthProvider";
import AppShellGuard from "./components/AppShellGuard";
import MainApp from "./MainApp";

export default function App() {
  return (
    <AuthProvider>
      <AppShellGuard>
        <MainApp />
      </AppShellGuard>
    </AuthProvider>
  );
}