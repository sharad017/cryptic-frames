"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const GAP = 4;
const TARGET_HEIGHT_DESKTOP = 300;
const TARGET_HEIGHT_TABLET = 220;

type Dim = { w: number; h: number };
type RowItem = { src: string; index: number; displayWidth: number; displayHeight: number };

export default function JustifiedGrid({
  images,
  category,
  onImageClick,
}: {
  images: string[];
  category: string;
  onImageClick: (idx: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [rows, setRows] = useState<RowItem[][]>([]);
  const dims = useRef<Map<number, Dim>>(new Map());
  const loadedCount = useRef(0);

  // Watch container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(e => setContainerWidth(e[0].contentRect.width));
    obs.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => obs.disconnect();
  }, []);

  const buildRows = useCallback(() => {
    if (!containerWidth || dims.current.size === 0) return;

    const isMobile = containerWidth < 640;
    const isTablet = containerWidth < 1024;
    const targetH = isTablet ? TARGET_HEIGHT_TABLET : TARGET_HEIGHT_DESKTOP;

    // Mobile: single column, full natural ratio, no justification needed
    if (isMobile) {
      const mobileRows: RowItem[][] = [];
      images.forEach((img, i) => {
        const d = dims.current.get(i);
        if (!d) return;
        mobileRows.push([{
          src: `/images/${category}/${img}`,
          index: i,
          displayWidth: containerWidth,
          displayHeight: Math.round(containerWidth * d.h / d.w),
        }]);
      });
      setRows(mobileRows);
      return;
    }

    // Desktop/Tablet: justified rows
    const items = images.map((img, i) => {
      const d = dims.current.get(i);
      return d ? { src: `/images/${category}/${img}`, index: i, ratio: d.w / d.h } : null;
    }).filter(Boolean) as { src: string; index: number; ratio: number }[];

    const newRows: RowItem[][] = [];
    let i = 0;

    while (i < items.length) {
      let rowItems = [];
      let totalRatio = 0;

      // Pack items into row until it fills the container at targetH
      while (i < items.length) {
        rowItems.push(items[i]);
        totalRatio += items[i].ratio;
        i++;
        const rowW = totalRatio * targetH + GAP * (rowItems.length - 1);
        if (rowW >= containerWidth) break;
      }

      // Calculate exact row height so items fill container width perfectly
      const totalGap = GAP * (rowItems.length - 1);
      // Cap height: last row (incomplete) shouldn't be enormous
      const isLastRow = i >= items.length && rowItems.length < 3;
      const rowH = isLastRow
        ? targetH  // last row: use target height, don't stretch
        : Math.round((containerWidth - totalGap) / totalRatio);

      newRows.push(rowItems.map(item => ({
        src: item.src,
        index: item.index,
        displayWidth: Math.round(rowH * item.ratio),
        displayHeight: rowH,
      })));
    }

    setRows(newRows);
  }, [containerWidth, images, category]);

  useEffect(() => { buildRows(); }, [buildRows]);

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>, idx: number) => {
    const img = e.currentTarget;
    dims.current.set(idx, { w: img.naturalWidth, h: img.naturalHeight });
    loadedCount.current++;
    // Rebuild progressively every 6 images, and on completion
    if (loadedCount.current % 6 === 0 || loadedCount.current === images.length) {
      buildRows();
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* Hidden image preloader to read natural dimensions */}
      <div style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: 1, height: 1, overflow: "hidden" }}>
        {images.map((image, index) => (
          <img
            key={index}
            src={`/images/${category}/${image}`}
            alt=""
            onLoad={e => onLoad(e, index)}
            loading={index < 9 ? "eager" : "lazy"}
          />
        ))}
      </div>

      {/* Justified rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px`, padding: containerWidth >= 1024 ? "0 24px" : "0" }}>
        {rows.length === 0 && (
          // Skeleton while loading
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-t animate-spin" style={{ borderColor: "var(--accent)" }} />
          </div>
        )}
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: "flex", gap: `${GAP}px`, height: row[0]?.displayHeight ?? "auto" }}>
            {row.map((item) => (
              <div
                key={item.index}
                className="relative overflow-hidden cursor-pointer group"
                style={{ width: item.displayWidth, height: item.displayHeight, flexShrink: 0 }}
                onClick={() => onImageClick(item.index)}
              >
                <img
                  src={item.src}
                  alt=""
                  loading={item.index < 6 ? "eager" : "lazy"}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110"
                  style={{ display: "block", willChange: "filter" }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: "rgba(6,6,6,0.2)" }}
                >
                  <div className="w-9 h-9 rounded-full border flex items-center justify-center"
                    style={{ borderColor: "rgba(255,255,255,0.4)" }}>
                    <span className="text-white text-xs">⤢</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
