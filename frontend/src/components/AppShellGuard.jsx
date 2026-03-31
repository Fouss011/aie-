import AuthScreen from "./AuthScreen";
import StructureSetupScreen from "./StructureSetupScreen";
import { useAuth } from "../context/AuthProvider";

export default function AppShellGuard({ children }) {
  const { loading, user, structures } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E7EDF5] px-4">
        <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-5 text-sm font-medium text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
          Chargement de ton espace...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!structures || structures.length === 0) {
    return <StructureSetupScreen />;
  }

  return children;
}