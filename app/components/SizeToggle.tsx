"use client";
import { useIsMobile } from "@/app/hooks/useIsMobile";

type Props = {
  value: number; // 1 = Small (more cols), 0 = Medium (default), -1 = Large (fewer cols)
  onChange: (value: number) => void;
};

export default function SizeToggle({ value, onChange }: Props) {
  const isMobile = useIsMobile();

  // Mobile: only Medium (1 col) and Small (2 cols) make sense.
  // Desktop: Large (2 cols), Medium (3 cols), Small (4 cols).
  const options = isMobile
    ? [
        { val: 0, label: "M", aria: "Single column (default)" },
        { val: 1, label: "S", aria: "Two columns" },
      ]
    : [
        { val: -1, label: "L", aria: "Large grid — 2 columns" },
        { val: 0, label: "M", aria: "Medium grid — 3 columns (default)" },
        { val: 1, label: "S", aria: "Small grid — 4 columns" },
      ];

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
        {options.map((opt) => {
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
