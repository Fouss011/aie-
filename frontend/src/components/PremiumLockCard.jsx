export default function PremiumLockCard({
  title = "Fonction premium",
  message = "Cette fonctionnalité est disponible pendant l’essai gratuit, puis avec un abonnement.",
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-semibold">🔒 {title}</p>
      <p className="mt-2 text-sm leading-6">{message}</p>

      <button
        type="button"
        className="mt-4 rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-medium text-white"
      >
        Activer l’abonnement
      </button>
    </div>
  );
}