import { useState } from "react";
import { requestSubscriptionPayment } from "../api/paymentsApi";
import { useAuth } from "../context/AuthProvider";

export default function SubscriptionBanner({ access }) {
  const { activeStructure } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const structureId = activeStructure?.id;
  const remainingDays = Number(access?.remainingDays || 0);

  // 🔥 IMPORTANT
  const isExpired = remainingDays <= 0;
  const isSubscribed = access?.isActive === true && isExpired;

  async function handleRequestPayment() {
    if (!structureId || loading) return;

    try {
      setLoading(true);
      setMessage("");

      const data = await requestSubscriptionPayment(structureId);
      window.location.href = data.paymentUrl;

    } catch (error) {
      setMessage(
        error?.message || "Impossible d’envoyer la demande pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border p-4 text-sm ${
        isExpired
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {isExpired ? (
            <>
              <p className="font-semibold">
                🚫 Ton essai est terminé.
              </p>
              <p className="mt-1">
                Active ton abonnement pour continuer à utiliser Moniva Copilot.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">
                ⏳ Il te reste {remainingDays} jour(s) d’essai.
              </p>
              {remainingDays <= 5 && (
                <p className="mt-1">
                  ⚠️ Ton essai se termine bientôt. Pense à activer ton abonnement.
                </p>
              )}
            </>
          )}

          {message && (
            <p className="mt-2 text-xs font-medium">
              {message}
            </p>
          )}
        </div>

        {/* 🔥 BOUTON INTELLIGENT */}
        {isSubscribed ? (
          <button
            type="button"
            disabled
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
          >
            Abonné
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRequestPayment}
            disabled={loading}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Envoi..." : "Activer mon abonnement"}
          </button>
        )}
      </div>
    </div>
  );
}