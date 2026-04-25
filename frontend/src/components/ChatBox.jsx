import { useEffect, useRef, useState } from "react";
import { askAssistant } from "../api/chatApi";
import { useAuth } from "../context/AuthProvider";
import { getTrialStatus } from "../utils/access";

export default function ChatBox() {
  const { activeStructure } = useAuth();

  const trialStatus = getTrialStatus(activeStructure);
  const canUsePremium = trialStatus.isTrialActive;

  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour. Je peux analyser ton activité, tes dépenses et tes tendances.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  function scrollToBottom(behavior = "smooth") {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior,
        block: "end",
      });
    });
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom("auto");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom("smooth");
    }
  }, [messages, isOpen]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  async function handleSubmit(event) {
    if (event) event.preventDefault();
    if (!question.trim() || loading || !canUsePremium) return;

    const currentQuestion = question.trim();

    if (!activeStructure?.id) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: currentQuestion },
        {
          role: "assistant",
          content:
            "Aucune structure active n’est sélectionnée pour analyser les données.",
        },
      ]);
      setQuestion("");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: currentQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await askAssistant(currentQuestion, activeStructure.id);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            response?.answer || "Je n’ai pas réussi à analyser les données.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error?.message || "Une erreur est survenue.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (window.innerWidth >= 768) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    }
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fermer le panneau Copilot"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]"
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:justify-end sm:px-5 sm:pb-5">
        {isOpen ? (
          <div className="pointer-events-auto relative flex h-[78vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] border border-slate-700/40 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(30,41,59,0.97))] shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl sm:h-[620px] sm:max-h-[calc(100vh-110px)] sm:rounded-[30px]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between border-b border-slate-700/40 bg-[linear-gradient(90deg,rgba(37,99,235,0.18),rgba(15,23,42,0.0))] px-4 py-4 text-left sm:px-5"
            >
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-blue-200">
                  Assistant IA
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                  Moniva Copilot
                </h3>
              </div>

              <span className="shrink-0 rounded-full border border-slate-600/60 bg-white/5 px-3 py-2 text-xs text-slate-200 sm:px-4 sm:text-sm">
                Réduire
              </span>
            </button>

            {canUsePremium ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                  {trialStatus.daysRemaining > 0 && (
                    <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm leading-6 text-blue-100">
                      Essai gratuit actif : encore {trialStatus.daysRemaining} jour(s)
                      pour utiliser Moniva Copilot.
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm ${
                        message.role === "user"
                          ? "ml-auto bg-blue-600 text-white"
                          : "bg-white/10 text-slate-100"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}

                  {loading && (
                    <div className="max-w-[90%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                      Analyse...
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="border-t border-slate-700/40 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      placeholder="Ex : résume mon activité du jour"
                      className="min-h-[58px] w-full resize-none rounded-2xl border border-slate-600/60 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400"
                    />

                    <button
                      type="submit"
                      disabled={loading || !question.trim()}
                      className="h-[52px] rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:min-w-[110px]"
                    >
                      Envoyer
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col justify-center px-5 py-6">
                <div className="rounded-[24px] border border-amber-300/30 bg-amber-400/10 p-5 text-amber-50">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
                    Abonnement requis
                  </p>

                  <h4 className="mt-3 text-2xl font-bold text-white">
                    Moniva Copilot est réservé aux abonnés
                  </h4>

                  <p className="mt-3 text-sm leading-7 text-amber-50/90">
                    Ton mois d’essai est terminé. Tu peux continuer à enregistrer
                    tes recettes et dépenses gratuitement. Pour accéder aux
                    analyses intelligentes et au copilote, active ton abonnement
                    Moniva.
                  </p>

                  <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-7 text-slate-100">
                    <p>✅ Enregistrement des recettes : disponible</p>
                    <p>✅ Enregistrement des dépenses : disponible</p>
                    <p>🔒 Analyses intelligentes : abonnement</p>
                    <p>🔒 Moniva Copilot : abonnement</p>
                  </div>

                  <button
                    type="button"
                    className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    Activer l’abonnement
                  </button>

                  <p className="mt-3 text-xs leading-5 text-amber-100/80">
                    Le paiement sera bientôt disponible. En attendant, contacte
                    l’équipe Moniva pour activer ton accès.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto inline-flex h-[54px] w-full max-w-[320px] items-center justify-center gap-3 rounded-full border border-slate-700/30 bg-[linear-gradient(180deg,#0B1F3A,#0F172A)] px-5 text-sm font-medium text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(15,23,42,0.34)] sm:h-[56px] sm:w-auto sm:max-w-none sm:px-6 sm:text-base"
          >
            <span className="h-3 w-3 rounded-full bg-sky-400" />
            Ouvrir Moniva Copilot
          </button>
        )}
      </div>
    </>
  );
}