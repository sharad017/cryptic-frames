"use client";
import { useState, useEffect } from "react";

export type FocalPoint = { desktop: string; mobile: string; desktopZoom?: number; mobileZoom?: number };
export type FocalMap = Record<string, FocalPoint>;

let cache: FocalMap | null = null;

export function useFocalPoints() {
  const [focal, setFocal] = useState<FocalMap>(cache || {});
  useEffect(() => {
    if (cache) { setFocal(cache); return; }
    fetch("/images/focal-points.json?t=" + Date.now())
      .then(r => r.json())
      .then(data => { cache = data; setFocal(data); })
      .catch(() => {});
  }, []);
  return focal;
}

export function getFocalStyle(
  focal: FocalMap,
  key: string,
  isMobile: boolean
): React.CSSProperties {
  const f = focal[key];
  if (!f) return { objectPosition: "center 35%" };
  const pos = isMobile ? (f.mobile || "50% 50%") : (f.desktop || "50% 35%");
  const zoom = isMobile ? (f.mobileZoom || 1) : (f.desktopZoom || 1);
  return {
    objectPosition: pos,
    transform: zoom > 1 ? `scale(${zoom})` : undefined,
    transformOrigin: pos,
  };
}
