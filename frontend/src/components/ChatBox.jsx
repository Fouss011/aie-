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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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

    const userMessage = {
      role: "user",
      content: question,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = cleanMessagesForApi(nextMessages);

      const result = await askAssistant(question, structureId, history);

      const assistantMessage = {
        role: "assistant",
        content:
          result?.answer ||
          "Je n’ai pas pu générer de réponse pour le moment.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
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
    <section className="rounded-[24px] border border-white/45 bg-white/70 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[30px] sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-blue-700">
            Moniva Copilot
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
            Assistant intelligent
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Pose une question sur ton activité, tes ventes ou tes dépenses.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm"
        >
          Réinitialiser
        </button>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-[22px] border border-slate-100 bg-slate-50/70 p-3">
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
                    : "border border-white/70 bg-white text-slate-700"
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              Analyse en cours...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ex : Je dois me concentrer sur quoi ?"
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </section>
  );
}