import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PersonalCopilotPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
  {
    role: "assistant",
    content:
      "Bonjour 👋 Je suis ton copilote financier personnel. Je peux t’aider à suivre ton reste à vivre, tes dépenses, tes budgets quotidiens, tes charges fixes et ton épargne.",
  },
]);

  const [input, setInput] = useState("");

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setInput("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/personal/copilot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            message: userMessage,
          }),
        }
      );

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.response ||
            "Je n’ai pas trouvé de réponse.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Une erreur est survenue pendant l’analyse.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-5 py-6 lg:px-8">
      <div className="flex h-[calc(100vh-120px)] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
            Monyva Copilot
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Assistant financier personnel
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Analyse tes dépenses, ton reste à vivre et ton épargne.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-7 ${
                  message.role === "assistant"
                    ? "bg-slate-100 text-slate-900"
                    : "ml-auto bg-slate-950 text-white"
                }`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="max-w-[85%] rounded-3xl bg-slate-100 px-5 py-4 text-sm text-slate-500">
                Analyse en cours...
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 p-5">
          <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Ex : Est-ce que je dépense trop en bouffe ?"
              className="flex-1 bg-transparent text-sm outline-none"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              <SendHorizonal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}