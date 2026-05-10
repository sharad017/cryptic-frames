"use client";
import { useState, useEffect } from "react";

type FocalPoint = { desktop: string; mobile: string };
type FocalMap = Record<string, FocalPoint>;

let cache: FocalMap | null = null;

export function useFocalPoints() {
  const [focal, setFocal] = useState<FocalMap>(cache || {});

  useEffect(() => {
    if (cache) { setFocal(cache); return; }
    fetch("/images/focal-points.json")
      .then(r => r.json())
      .then(data => { cache = data; setFocal(data); })
      .catch(() => {});
  }, []);

  return focal;
}

export function getFocalStyle(focal: FocalMap, key: string, isMobile: boolean): React.CSSProperties {
  const f = focal[key];
  if (!f) return { objectPosition: "center center" };
  return { objectPosition: isMobile ? f.mobile : f.desktop };
}
