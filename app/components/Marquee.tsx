export default function Marquee() {
  const items = [
    "Concert", "Wildlife", "Portrait", "Travel", "Street", "Event",
    "Concert", "Wildlife", "Portrait", "Travel", "Street", "Event",
  ];
  return (
    <div className="overflow-hidden py-5 border-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="marquee-track">
        {items.concat(items).map((item, i) => (
          <span key={i} className="flex items-center gap-6 pr-6">
            <span
              className="text-xs tracking-[0.45em] uppercase whitespace-nowrap"
              style={{ color: i % 2 === 0 ? "var(--accent)" : "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              {item}
            </span>
            <span style={{ color: "var(--border)", fontSize: "0.5rem" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
