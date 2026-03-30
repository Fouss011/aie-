import { useEffect, useRef, useState } from "react";
import { askAssistant } from "../api/chatApi";

export default function ChatBox() {
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

  const messagesContainerRef = useRef(null);
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

  async function handleSubmit(event) {
    if (event) event.preventDefault();
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: currentQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await askAssistant(currentQuestion);

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
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="h-[620px] w-[400px] max-h-[calc(100vh-110px)] max-w-[calc(100vw-24px)] overflow-hidden rounded-[30px] border border-slate-700/40 bg-[linear-gradient(180deg,rgba(15,23,42,0.97),rgba(30,41,59,0.96))] shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
          <div className="flex h-full flex-col">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between border-b border-slate-700/40 bg-[linear-gradient(90deg,rgba(37,99,235,0.18),rgba(15,23,42,0.0))] px-5 py-4 text-left"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-blue-200">
                  Assistant IA
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  AIE Copilot
                </h3>
              </div>

              <span className="rounded-full border border-slate-600/60 bg-white/5 px-4 py-2 text-sm text-slate-200">
                Réduire
              </span>
            </button>

            <div
              ref={messagesContainerRef}
              className="flex-1 space-y-3 overflow-y-auto px-5 py-5"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm ${
                    message.role === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-white/10 text-slate-100"
                  }`}
                >
                  {message.content}
                </div>
              ))}

              {loading && (
                <div className="max-w-[88%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                  Analyse...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-slate-700/40 p-5"
            >
              <div className="flex gap-3">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Ex : résume mon activité du jour"
                  className="min-h-[58px] flex-1 resize-none rounded-2xl border border-slate-600/60 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400"
                />

                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-3 inline-flex min-h-[60px] items-center gap-3 rounded-full border border-slate-700/30 bg-[linear-gradient(180deg,#0B1F3A,#0F172A)] px-6 py-4 text-base font-medium text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(15,23,42,0.34)]"
        >
          <span className="h-3 w-3 rounded-full bg-sky-400" />
          Ouvrir AIE Copilot
        </button>
      )}
    </div>
  );
}