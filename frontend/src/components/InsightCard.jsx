export default function InsightCard({ insight }) {
  const colorMap = {
    success: "text-emerald-600 bg-emerald-50 border-emerald-200",
    danger: "text-red-600 bg-red-50 border-red-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    info: "text-blue-600 bg-blue-50 border-blue-200",
  };

  const style = colorMap[insight?.type] || colorMap.info;

  return (
    <div className={`rounded-2xl border p-4 ${style}`}>
      <p className="text-sm font-medium">
        💡 Insight du jour
      </p>
      <p className="mt-1 text-base font-semibold">
        {insight?.message}
      </p>
    </div>
  );
}