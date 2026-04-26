import { useEffect, useRef, useState } from "react";
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

export default function ChatBox() {
  const { activeStructure } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour. Je peux analyser ton activité, tes dépenses et tes tendances.",
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

  async function handleSend(event) {
    event?.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    if (!structureId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Aucune structure active n’est sélectionnée. Connecte-toi ou choisis une structure avant d’utiliser le copilot.",
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
      if (!result?.answer) return;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.message ||
            "Impossible de contacter Moniva Copilot pour le moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
        <div className="fixed bottom-6 right-4 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-[28px] border border-white/50 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:bottom-6 sm:right-6">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="border-b border-slate-100 bg-[linear-gradient(135deg,#020617,#0f172a)] p-4 text-left text-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-blue-200">
                  Moniva Copilot
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Assistant intelligent
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-300">
                  Clique ici pour réduire le copilot.
                </p>
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                Réduire
              </span>
            </div>
          </button>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/80 p-3">
            {messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      isUser
                        ? "bg-blue-600 text-white"
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
                <div className="rounded-2xl border border-white/80 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Analyse en cours...
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
                placeholder="Ex : Je dois me concentrer sur quoi ?"
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Envoyer
              </button>
            </form>

            <button
              type="button"
              onClick={handleReset}
              className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Réinitialiser la conversation
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-3 rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)] hover:bg-slate-900"
        >
          <span className="h-3 w-3 rounded-full bg-sky-400" />
          Ouvrir Moniva Copilot
        </button>
      )}
    </>
  );
}