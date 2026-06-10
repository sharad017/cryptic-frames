"use client";
import { useState, useEffect } from "react";

type AltMap = Record<string, string>;

let cache: AltMap | null = null;

export function useAltText(): AltMap {
  const [altMap, setAltMap] = useState<AltMap>(cache || {});

  useEffect(() => {
    if (cache) return;
    fetch("/images/alt.json")
      .then((r) => r.json())
      .then((data: AltMap) => {
        cache = data;
        setAltMap(data);
      })
      .catch(() => {}); // graceful fallback if file doesn't exist yet
  }, []);

  return altMap;
}

export function getAlt(altMap: AltMap, category: string, filename: string): string {
  return altMap[`${category}/${filename}`] || `${category} photography by Sharad Rajput`;
}
