import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Wallet,
  Activity,
} from "lucide-react";

import { formatMoney } from "../utils/finance";

function Card({
  title,
  subtitle,
  value,
  icon: Icon,
  color,
  progress,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-70" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500">
              {title}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {subtitle}
            </p>
          </div>

          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl ${color.bg}`}
          >
            <Icon className={`h-5 w-5 ${color.icon}`} />
          </div>
        </div>

        <h3 className={`mt-6 text-3xl font-black tracking-tight ${color.text}`}>
          {value}
        </h3>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${color.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function KpiGrid({ kpis }) {
  const salesToday = Number(kpis?.salesToday || 0);
  const expensesToday = Number(kpis?.expensesToday || 0);
  const profitToday = Number(kpis?.profitToday || 0);
  const salesMonth = Number(kpis?.salesMonth || 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Recettes du jour"
        subtitle="Entrées enregistrées"
        value={formatMoney(salesToday)}
        icon={ArrowUpRight}
        progress={75}
        color={{
          text: "text-emerald-600",
          bg: "bg-emerald-100",
          icon: "text-emerald-600",
          bar: "bg-emerald-500",
        }}
      />

      <Card
        title="Charges du jour"
        subtitle="Sorties enregistrées"
        value={formatMoney(expensesToday)}
        icon={ArrowDownRight}
        progress={45}
        color={{
          text: "text-rose-600",
          bg: "bg-rose-100",
          icon: "text-rose-600",
          bar: "bg-rose-500",
        }}
      />

      <Card
        title="Résultat du jour"
        subtitle="Situation actuelle"
        value={formatMoney(profitToday)}
        icon={Wallet}
        progress={65}
        color={{
          text: "text-blue-600",
          bg: "bg-blue-100",
          icon: "text-blue-600",
          bar: "bg-blue-500",
        }}
      />

      <Card
        title="Recettes du mois"
        subtitle="Vision mensuelle"
        value={formatMoney(salesMonth)}
        icon={Calendar}
        progress={85}
        color={{
          text: "text-slate-900",
          bg: "bg-slate-100",
          icon: "text-slate-700",
          bar: "bg-slate-900",
        }}
      />
    </div>
  );
}