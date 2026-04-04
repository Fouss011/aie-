import { supabase } from "./supabase";

export async function signUpWithEmail({ fullName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}`,
      data: {
        full_name: fullName || "",
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function resendConfirmationEmail(email) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${window.location.origin}`,
    },
  });

  if (error) throw error;
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}`,
  });

  if (error) throw error;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function createStructure({ name, slug, sector, country, city }) {
  const { data, error } = await supabase.rpc("create_structure_for_current_user", {
    p_name: name,
    p_slug: slug || null,
    p_sector: sector || null,
    p_country: country || "TG",
    p_city: city || null,
  });

  if (error) throw error;
  return data;
}

export async function getMyStructures() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("memberships")
    .select("id, role, structure_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  if (!data || data.length === 0) {
    return [];
  }

  const structureIds = data
    .map((item) => item.structure_id)
    .filter(Boolean);

  if (structureIds.length === 0) {
    return [];
  }

  const { data: structures, error: structuresError } = await supabase
    .from("structures")
    .select("id, name, slug, sector, country, city, owner_user_id, created_at")
    .in("id", structureIds);

  if (structuresError) throw structuresError;

  const structureMap = new Map(
    (structures || []).map((structure) => [structure.id, structure])
  );

  return data
    .map((membership) => ({
      ...membership,
      structure: structureMap.get(membership.structure_id) || null,
    }))
    .filter((item) => item.structure);
}

export async function getMyProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}