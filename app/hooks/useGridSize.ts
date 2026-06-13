"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cf-grid-size";

/**
 * Persists the visitor's gallery grid size preference (-1 = Large, 0 = Medium, 1 = Small)
 * across page loads and gallery categories using localStorage.
 */
export function useGridSize(): [number, (value: number) => void] {
  const [value, setValue] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if ([-1, 0, 1].includes(parsed)) setValue(parsed);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — fall back to default
    }
  }, []);

  const update = useCallback((v: number) => {
    setValue(v);
    try { localStorage.setItem(STORAGE_KEY, String(v)); } catch {}
  }, []);

  return [value, update];
}
