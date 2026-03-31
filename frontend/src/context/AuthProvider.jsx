import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  getCurrentSession,
  getMyProfile,
  getMyStructures,
  signOutUser,
} from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [structures, setStructures] = useState([]);
  const [activeStructure, setActiveStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshAccountData(currentUser) {
    if (!currentUser) {
      setProfile(null);
      setStructures([]);
      setActiveStructure(null);
      return;
    }

    try {
      const [profileData, structuresData] = await Promise.all([
        getMyProfile(),
        getMyStructures(),
      ]);

      setProfile(profileData || null);
      setStructures(structuresData || []);

      setActiveStructure((prev) => {
        if (prev?.id) {
          const stillExists = (structuresData || []).find(
            (item) => item.structure?.id === prev.id
          );
          if (stillExists?.structure) return stillExists.structure;
        }

        return structuresData?.[0]?.structure || null;
      });
    } catch (error) {
      console.error("Erreur refreshAccountData:", error);
      setProfile(null);
      setStructures([]);
      setActiveStructure(null);
      throw error;
    }
  }

  async function bootstrap() {
    try {
      setLoading(true);

      const currentSession = await getCurrentSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await refreshAccountData(currentSession.user);
      } else {
        setProfile(null);
        setStructures([]);
        setActiveStructure(null);
      }
    } catch (error) {
      console.error("Erreur bootstrap auth:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setStructures([]);
        setActiveStructure(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      Promise.resolve(refreshAccountData(nextSession.user))
        .catch((error) => {
          console.error("Erreur onAuthStateChange:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    });

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    try {
      setLoading(true);
      await signOutUser();
      setProfile(null);
      setStructures([]);
      setActiveStructure(null);
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Erreur logout:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      structures,
      activeStructure,
      setActiveStructure,
      loading,
      refreshAccountData: () => refreshAccountData(user),
      logout,
    }),
    [session, user, profile, structures, activeStructure, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }

  return context;
}