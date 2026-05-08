import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, Send, Sparkles, X } from "lucide-react";
import { askAssistant } from "../api/chatApi";
import { useAuth } from "../context/AuthProvider";

function cleanMessagesForApi(messages) {
  return messages
    .filter((msg) => msg?.role && msg?.content)
    .slice(-6)
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
}

const QUICK_QUESTIONS = [
  "Pourquoi mon résultat baisse ?",
  "Que dois-je améliorer cette semaine ?",
  "Donne-moi un conseil aujourd’hui",
];

export default function ChatBox() {
  const { activeStructure } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour. Je suis Monyva. Je peux analyser tes recettes, tes dépenses et t’aider à prendre de meilleures décisions.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const structureId = activeStructure?.id;

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  async function sendQuestion(questionValue) {
    const question = questionValue.trim();
    if (!question || loading) return;

    if (!structureId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Aucune structure active n’est sélectionnée. Connecte-toi ou choisis une structure avant d’utiliser le copilote.",
        },
      ]);
      return;
    }

    const userMessage = { role: "user", content: question };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = cleanMessagesForApi(nextMessages);
      const result = await askAssistant(question, structureId, history);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result?.answer,
        },
      ]);
    } catch (error) {
      if (error.message === "SUBSCRIPTION_REQUIRED") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "🚫 Ton essai est terminé. Active ton abonnement Monyva pour continuer à utiliser le Copilot.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.message ||
            "Impossible de contacter Monyva Copilot pour le moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(event) {
    event?.preventDefault();
    sendQuestion(input);
  }

  function handleReset() {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation réinitialisée. Pose-moi une question sur tes recettes, dépenses ou tendances.",
      },
    ]);
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-x-3 bottom-4 z-50 flex h-[78vh] max-h-[680px] flex-col overflow-hidden rounded-[30px] border border-white/60 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.28)] backdrop-blur-2xl sm:inset-x-auto sm:right-6 sm:h-[620px] sm:w-[430px]">
          <div className="relative overflow-hidden border-b border-white/10 bg-slate-950 p-4 text-white">
            <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="relative flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-blue-100">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-200">
                    Monyva Copilot
                  </p>
                  <h2 className="mt-1 text-lg font-black">Assistant de décision</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Analyse simple de ton activité.
                  </p>
                </div>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15"
                  aria-label="Réduire"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15"
                  aria-label="Réinitialiser"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/80 p-3 sm:p-4">
            {messages.length <= 1 && (
              <div className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  <Sparkles className="h-4 w-4" /> Questions rapides
                </p>
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendQuestion(question)}
                    className="rounded-2xl bg-slate-100 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      isUser
                        ? "bg-slate-950 text-white"
                        : "border border-white/80 bg-white text-slate-700"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-white/80 bg-white px-4 py-3 text-sm font-medium text-slate-500 shadow-sm">
                  Monyva analyse votre activité...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white p-3">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ex : Que dois-je améliorer ?"
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Envoyer"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-3 rounded-full border border-white/20 bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-[0_22px_60px_rgba(15,23,42,0.38)] transition hover:-translate-y-0.5 hover:bg-slate-900 sm:right-6"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-400" />
          </span>
          Monyva Copilot
        </button>
      )}
    </>
  );
}
