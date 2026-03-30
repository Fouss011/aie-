function formatValue(value) {
  if (value === null || value === undefined || value === "") return "0";
  return String(value);
}

export default function KpiGrid({ kpis = {} }) {
  const cards = [
    {
      title: "Activité du jour",
      value: `${formatValue(kpis.salesToday)} FCFA`,
      subtitle: "Entrées du jour",
      tone: "text-emerald-600",
    },
    {
      title: "Charges du jour",
      value: `${formatValue(kpis.expensesToday)} FCFA`,
      subtitle: "Sorties du jour",
      tone: "text-rose-600",
    },
    {
      title: "Résultat du jour",
      value: `${formatValue(kpis.profitToday)} FCFA`,
      subtitle: "Net journalier",
      tone: "text-blue-700",
    },
    {
      title: "Activité du mois",
      value: `${formatValue(kpis.salesMonth)} FCFA`,
      subtitle: "Cumul mensuel",
      tone: "text-violet-700",
    },
    {
      title: "Résultat du mois",
      value: `${formatValue(kpis.profitMonth)} FCFA`,
      subtitle: "Performance",
      tone: "text-amber-600",
    },
    {
      title: "Nombre d’activités",
      value: formatValue(kpis.salesCount),
      subtitle: "Enregistrements",
      tone: "text-slate-900",
    },
    {
      title: "Nombre de charges",
      value: formatValue(kpis.expensesCount),
      subtitle: "Enregistrements",
      tone: "text-slate-900",
    },
    {
      title: "Activité phare",
      value: formatValue(kpis.topProduct || "Aucune donnée"),
      subtitle: "Tendance principale",
      tone: "text-slate-900",
      isText: true,
    },
  ];

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-3xl font-bold text-slate-950">Dashboard</h2>
        <p className="mt-1 text-slate-500">Vue rapide de ton activité</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="min-h-[150px] rounded-[24px] border border-white/50 bg-white/55 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
          >
            <p className="text-sm font-medium text-slate-500">{card.title}</p>

            <div className="mt-3 flex min-h-[60px] items-start">
              <h3
                className={`font-bold break-words ${
                  card.isText
                    ? "text-xl leading-tight"
                    : "text-3xl leading-tight"
                } ${card.tone}`}
              >
                {card.value}
              </h3>
            </div>

            <p className="mt-3 text-sm text-slate-400">{card.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}