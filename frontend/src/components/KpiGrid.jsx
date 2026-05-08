import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  ReceiptText,
  Star,
} from "lucide-react";
import { formatMoney } from "../utils/finance";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "0";
  return String(value);
}

function money(value) {
  return formatMoney(Number(value || 0));
}

export default function KpiGrid({ kpis = {} }) {
  const cards = [
    {
      title: "Recettes du jour",
      value: money(kpis.salesToday),
      subtitle: "Argent entré aujourd’hui",
      icon: ArrowUpRight,
      tone: "text-emerald-600",
      ring: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Dépenses du jour",
      value: money(kpis.expensesToday),
      subtitle: "Argent sorti aujourd’hui",
      icon: ArrowDownRight,
      tone: "text-rose-600",
      ring: "bg-rose-50 text-rose-700",
    },
    {
      title: "Résultat du jour",
      value: money(kpis.profitToday),
      subtitle: Number(kpis.profitToday || 0) >= 0 ? "Journée positive" : "Journée à surveiller",
      icon: CircleDollarSign,
      tone: Number(kpis.profitToday || 0) >= 0 ? "text-blue-700" : "text-rose-600",
      ring: "bg-blue-50 text-blue-700",
    },
    {
      title: "Recettes du mois",
      value: money(kpis.salesMonth),
      subtitle: "Cumul mensuel",
      icon: CalendarDays,
      tone: "text-slate-950",
      ring: "bg-slate-100 text-slate-700",
    },
    {
      title: "Résultat du mois",
      value: money(kpis.profitMonth),
      subtitle: Number(kpis.profitMonth || 0) >= 0 ? "Activité rentable" : "Marge négative",
      icon: BarChart3,
      tone: Number(kpis.profitMonth || 0) >= 0 ? "text-emerald-700" : "text-rose-600",
      ring: Number(kpis.profitMonth || 0) >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
      featured: true,
    },
    {
      title: "Activités enregistrées",
      value: formatValue(kpis.salesCount),
      subtitle: "Recettes saisies",
      icon: Activity,
      tone: "text-slate-950",
      ring: "bg-violet-50 text-violet-700",
    },
    {
      title: "Dépenses enregistrées",
      value: formatValue(kpis.expensesCount),
      subtitle: "Charges saisies",
      icon: ReceiptText,
      tone: "text-slate-950",
      ring: "bg-amber-50 text-amber-700",
    },
    {
      title: "Activité phare",
      value: formatValue(kpis.topProduct || "Aucune donnée"),
      subtitle: "Tendance principale",
      icon: Star,
      tone: "text-slate-950",
      ring: "bg-yellow-50 text-yellow-700",
      isText: true,
      full: true,
    },
  ];

  return (
    <section className="w-full overflow-x-hidden">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Vue rapide
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
            Ce qu’il faut retenir
          </h2>
        </div>
        <p className="hidden max-w-sm text-right text-sm leading-6 text-slate-500 md:block">
          Des chiffres simples pour décider vite, sans comptabilité lourde.
        </p>
      </div>

      <div className="grid gap-3 min-[380px]:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`group min-w-0 rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.06)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-[0_22px_55px_rgba(15,23,42,0.10)] sm:p-5 ${
                card.featured ? "ring-1 ring-emerald-200/70" : ""
              } ${card.full ? "min-[380px]:col-span-2 xl:col-span-1" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500 sm:text-sm">
                    {card.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{card.subtitle}</p>
                </div>

                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${card.ring}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 min-h-[46px] sm:min-h-[56px]">
                <h3
                  className={`break-words font-black tracking-tight ${
                    card.isText
                      ? "text-xl leading-tight sm:text-[26px]"
                      : "text-[22px] leading-tight sm:text-[29px]"
                  } ${card.tone}`}
                >
                  {card.value}
                </h3>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full w-2/3 rounded-full ${card.featured ? "bg-emerald-400" : "bg-slate-300"}`} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
