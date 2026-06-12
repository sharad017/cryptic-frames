"use client";

type Props = {
  value: number; // 1 = Small (more columns), 0 = Medium (default), -1 = Large (fewer columns)
  onChange: (value: number) => void;
};

const OPTIONS: { val: number; label: string; aria: string }[] = [
  { val: 1, label: "S", aria: "Small grid — more columns" },
  { val: 0, label: "M", aria: "Medium grid — default" },
  { val: -1, label: "L", aria: "Large grid — fewer columns" },
];

export default function SizeToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[9px] tracking-[0.35em] uppercase"
        style={{ color: "#6a6a6a", fontFamily: "var(--font-body)" }}
      >
        View
      </span>
      <div
        className="flex items-center"
        style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: "100px", padding: "3px" }}
      >
        {OPTIONS.map((opt) => {
          const active = value === opt.val;
          return (
            <button
              key={opt.label}
              onClick={() => onChange(opt.val)}
              aria-label={opt.aria}
              aria-pressed={active}
              style={{
                width: "26px",
                height: "22px",
                borderRadius: "100px",
                fontSize: "9px",
                letterSpacing: "0.2em",
                fontFamily: "var(--font-body)",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#060606" : "#9a9a9a",
                border: "none",
                cursor: "pointer",
                transition: "background 0.25s, color 0.25s",
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#9a9a9a"; }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
