export default function StatCard({ title, value, subtitle }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
      {subtitle ? (
        <div style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}