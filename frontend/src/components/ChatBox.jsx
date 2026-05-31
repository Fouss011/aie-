import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  Send,
  Sparkles,
  X,
} from "lucide-react";

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

const BUSINESS_QUESTIONS = [
  "Pourquoi mon résultat baisse ?",
  "Que dois-je améliorer cette semaine ?",
  "Quelle activité rapporte le plus ?",
];

const PERSONAL_QUESTIONS = [
  "Combien il me reste ?",
  "Est-ce que je dépense trop en bouffe ?",
  "Puis-je économiser 200 € ce mois-ci ?",
];

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ChatBox({ universe = "business" }) {
  const { activeStructure, user } = useAuth();

  const isPersonal = universe === "personal";
  console.log("CHATBOX UNIVERSE =>", universe);

  const [isOpen, setIsOpen] = useState(false);

  const initialMessage = useMemo(
    () => ({
      role: "assistant",
      content: isPersonal
        ? "Bonjour 👋 Je suis ton copilote financier personnel. Je peux analyser ton reste à vivre, tes dépenses, tes budgets, tes charges fixes et ton épargne."
        : "Bonjour 👋 Je suis Monyva. Je peux analyser ton activité et détecter ce qui mérite ton attention.",
    }),
    [isPersonal]
  );

  const [messages, setMessages] = useState([
    initialMessage,
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const structureId = activeStructure?.id;
  const userId = user?.id || activeStructure?.user_id;

  const quickQuestions = isPersonal
    ? PERSONAL_QUESTIONS
    : BUSINESS_QUESTIONS;

  useEffect(() => {
    setMessages([initialMessage]);
    setInput("");
  }, [initialMessage]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, loading, isOpen]);

  async function sendQuestion(questionValue) {
    const question = questionValue.trim();

    if (!question || loading) return;

    if (!isPersonal && !structureId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Aucune structure active sélectionnée. Choisis une structure avant d’utiliser Monyva.",
        },
      ]);

      return;
    }

    if (isPersonal && !userId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Je n’arrive pas à identifier ton compte. Reconnecte-toi puis réessaie.",
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

      let result;

      if (isPersonal) {
        const response = await fetch(
          `${API_URL}/api/personal/copilot`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              message: question,
              history,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Impossible de contacter le Copilot Perso."
          );
        }

        const data = await response.json();

        result = {
          answer:
            data?.response ||
            "Je n’ai pas trouvé de réponse pour le moment.",
        };
      } else {
        result = await askAssistant(
          question,
          structureId,
          history
        );
      }

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
              "Le Copilot est temporairement indisponible. Réessaie plus tard.",
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
            "Impossible de contacter Monyva pour le moment.",
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
        content: isPersonal
          ? "Conversation réinitialisée. Pose-moi une question sur ton budget personnel."
          : "Conversation réinitialisée. Pose-moi une question sur ton activité.",
      },
    ]);
  }

  return (
    <>
      {isOpen && (
  <div className="fixed inset-x-3 bottom-3 z-50 flex h-[82vh] max-h-[680px] flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:inset-x-auto sm:right-6 sm:h-[620px] sm:w-[430px]">
    <div className="shrink-0 border-b border-slate-800 bg-slate-950 px-4 py-3 text-white">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-blue-100">
            <Bot className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-blue-200">
              Monyva Copilot
            </p>

            <h2 className="truncate text-base font-black">
              {isPersonal
                ? "Assistant financier personnel"
                : "Assistant de décision"}
            </h2>

            <p className="truncate text-[11px] text-slate-300">
              {isPersonal
                ? "Analyse de ton budget personnel"
                : "Analyse intelligente de ton activité"}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15"
          >
            <ChevronDown className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
      {messages.length <= 1 && (
        <div className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            <Sparkles className="h-4 w-4" />
            Questions rapides
          </p>

          {quickQuestions.map((question) => (
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
              className={`max-w-[88%] whitespace-pre-wrap rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                isUser
                  ? "bg-slate-950 text-white"
                  : "border-l-4 border-blue-500 bg-white text-slate-700"
              }`}
            >
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] opacity-60">
                {isUser ? "Vous" : "Monyva"}
              </p>

              {message.content}
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="flex justify-start">
          <div className="rounded-[22px] border-l-4 border-blue-500 bg-white px-4 py-3 text-sm font-medium text-slate-500 shadow-sm">
            {isPersonal
              ? "Monyva analyse votre budget..."
              : "Monyva analyse votre activité..."}
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
          placeholder={
            isPersonal
              ? "Ex : Est-ce que je dépense trop ?"
              : "Ex : Que dois-je améliorer ?"
          }
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
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