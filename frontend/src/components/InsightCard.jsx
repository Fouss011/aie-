import { AlertTriangle, CheckCircle2, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { formatMoney } from "../utils/finance";

const config = {
  success: {
    icon: CheckCircle2,
    badge: "Situation favorable",
    shell: "border-emerald-200/70 bg-emerald-50/70",
    iconBox: "bg-emerald-600 text-white",
    title: "text-emerald-900",
    text: "text-emerald-800",
  },
  danger: {
    icon: AlertTriangle,
    badge: "Point critique",
    shell: "border-rose-200/70 bg-rose-50/75",
    iconBox: "bg-rose-600 text-white",
    title: "text-rose-900",
    text: "text-rose-800",
  },
  warning: {
    icon: Lightbulb,
    badge: "Optimisation possible",
    shell: "border-amber-200/70 bg-amber-50/75",
    iconBox: "bg-amber-500 text-white",
    title: "text-amber-950",
    text: "text-amber-900",
  },
  info: {
    icon: Sparkles,
    badge: "Analyse Monyva",
    shell: "border-blue-200/70 bg-blue-50/75",
    iconBox: "bg-blue-600 text-white",
    title: "text-blue-950",
    text: "text-blue-900",
  },
};

export default function InsightCard({ insight, kpis = {} }) {
  const style = config[insight?.type] || config.info;
  const Icon = style.icon;
  const profitMonth = Number(kpis?.profitMonth || 0);

  return (
    <section className={`overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6 ${style.shell}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-sm ${style.iconBox}`}>
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                Centre d’intelligence
              </p>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-700">
                {style.badge}
              </span>
            </div>

            <h2 className={`mt-2 text-2xl font-black leading-tight sm:text-3xl ${style.title}`}>
              {insight?.message || "Ajoutez vos premières données pour obtenir un conseil utile."}
            </h2>

            <p className={`mt-3 max-w-3xl text-sm leading-7 sm:text-base ${style.text}`}>
              Monyva ne cherche pas à compliquer votre gestion. Il transforme vos recettes et dépenses en décisions simples : continuer, réduire, corriger ou renforcer.
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-3xl border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur-md lg:min-w-[260px]">
          <div className="flex items-center gap-2 text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-[0.20em]">Résultat mois</p>
          </div>
          <p className={`mt-2 text-2xl font-black ${profitMonth >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {formatMoney(profitMonth)}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Demandez au copilote : “Que dois-je améliorer cette semaine ?”
          </p>
        </div>
      </div>
    </section>
  );
}
