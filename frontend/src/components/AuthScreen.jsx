import { useState } from "react";
import {
  resendConfirmationEmail,
  sendPasswordReset,
  signInWithEmail,
  signUpWithEmail,
} from "../lib/auth";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState("");

  const showPassword =
    mode === "login" ? showLoginPassword : showSignupPassword;

  function togglePasswordVisibility() {
    if (mode === "login") {
      setShowLoginPassword((value) => !value);
    } else {
      setShowSignupPassword((value) => !value);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorText("");

    try {
      if (mode === "signup") {
        const result = await signUpWithEmail({ fullName, email, password });

        if (result?.user?.id) {
          setMessage(
            "Si cet email est nouveau, un lien de confirmation a été envoyé. Si tu as déjà un compte, connecte-toi ou renvoie l’email de confirmation."
          );
        } else {
          setMessage(
            "Demande d’inscription envoyée. Si cet email est nouveau, vérifie ta boîte mail."
          );
        }
      } else {
        await signInWithEmail({ email, password });
      }
    } catch (error) {
      setErrorText(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    try {
      setMessage("");
      setErrorText("");

      if (!email.trim()) {
        setErrorText("Entre ton email pour renvoyer le lien de confirmation.");
        return;
      }

      setLoading(true);
      await resendConfirmationEmail(email);

      setMessage(
        "Si ce compte existe et n’est pas encore confirmé, un nouvel email a été envoyé."
      );
    } catch (error) {
      setErrorText(error.message || "Impossible de renvoyer l’email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    try {
      setMessage("");
      setErrorText("");

      if (!email.trim()) {
        setErrorText("Entre ton email pour recevoir un lien de réinitialisation.");
        return;
      }

      setLoading(true);
      await sendPasswordReset(email);

      setMessage(
        "Si ce compte existe, un email de réinitialisation a été envoyé."
      );
    } catch (error) {
      setErrorText(
        error.message || "Impossible d’envoyer l’email de réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setErrorText("");
  }

  return (
    <div className="min-h-screen bg-[#E7EDF5] px-4 py-8">
      <div className="mx-auto max-w-md rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
        <div className="mb-6">
          <div className="inline-flex rounded-full border border-blue-300/60 bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
            Monyva
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-950">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Accède à ton espace structure et pilote tes données de façon sécurisée.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-20 text-sm outline-none focus:border-blue-400"
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-700"
              >
                {showPassword ? "Masquer" : "Voir"}
              </button>
            </div>
          </div>

          {message && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {errorText && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorText}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading
              ? "Patiente..."
              : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
          </button>

          <div className="pt-1 text-center text-sm">
            {mode === "login" ? (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="font-medium text-blue-700 hover:underline disabled:opacity-60"
              >
                Mot de passe oublié ?
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={loading}
                className="font-medium text-blue-700 hover:underline disabled:opacity-60"
              >
                Renvoyer l’email de confirmation
              </button>
            )}
          </div>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          {mode === "login" ? "Pas encore de compte ?" : "Tu as déjà un compte ?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-blue-700 hover:underline"
          >
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}