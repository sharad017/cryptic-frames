"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street", "product"];
const PASSWORD = "Hamilton2005!@#";
const STORAGE_KEY = "cf_image_order";

type ImageMap = Record<string, string[]>;
type FocalPoint = { desktop: string; mobile: string };
type FocalMap = Record<string, FocalPoint>;
type AdminView = "reorder" | "focal";

function saveOrder(order: ImageMap) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(order)); } catch {}
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [images, setImages] = useState<ImageMap>({});
  const [activeTab, setActiveTab] = useState("featured");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<AdminView>("reorder");
  const [focal, setFocal] = useState<FocalMap>({});
  const [focalSaving, setFocalSaving] = useState<string | null>(null);
  const [focalEditing, setFocalEditing] = useState<string | null>(null); // "category/file.jpg"
  const [focalMode, setFocalMode] = useState<"desktop" | "mobile">("mobile");

  const dragIdx = useRef<number | null>(null);
  const dragOverIdxState = useRef<number | null>(null);
  const [, forceUpdate] = useState(0);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/images/manifest.json?t=" + Date.now());
      const manifest = await res.json();
      const merged: ImageMap = {};
      for (const cat of CATEGORIES) {
        merged[cat] = manifest[cat] || [];
      }
      setImages(merged);
      saveOrder(merged);
    } catch {}
    setLoading(false);
  }, []);

  const loadFocal = useCallback(async () => {
    try {
      const res = await fetch("/images/focal-points.json?t=" + Date.now());
      setFocal(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    const s = sessionStorage.getItem("cf_admin");
    if (s === PASSWORD) { setAuthed(true); loadImages(); loadFocal(); }
  }, [loadImages, loadFocal]);

  const login = () => {
    if (pw === PASSWORD) {
      sessionStorage.setItem("cf_admin", pw);
      setAuthed(true);
      loadImages();
      loadFocal();
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

  // ── Drag to reorder ──
  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragOverIdxState.current !== idx) {
      dragOverIdxState.current = idx;
      forceUpdate(n => n + 1);
    }
  };
  const onDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragIdx.current;
    if (fromIdx === null || fromIdx === toIdx) {
      dragIdx.current = null; dragOverIdxState.current = null;
      forceUpdate(n => n + 1); return;
    }
    const list = [...(images[activeTab] || [])];
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    setImages(prev => ({ ...prev, [activeTab]: list }));
    dragIdx.current = null; dragOverIdxState.current = null;
  };
  const onDragEnd = () => { dragIdx.current = null; dragOverIdxState.current = null; forceUpdate(n => n + 1); };

  // ── Save order → updates manifest on server ──
  const handleSaveOrder = async () => {
    setSaved(false);
    try {
      const res = await fetch("/api/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeTab, images: images[activeTab] || [] }),
      });
      const data = await res.json();
      if (data.success) {
        setImages(prev => ({ ...prev, [activeTab]: data.images }));
        saveOrder({ ...images, [activeTab]: data.images });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // fallback: save locally
      saveOrder(images);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // ── Focal point editor ──
  const handleFocalClick = (e: React.MouseEvent<HTMLDivElement>, key: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const pos = `${x}% ${y}%`;
    setFocal(prev => ({
      ...prev,
      [key]: {
        desktop: focalMode === "desktop" ? pos : (prev[key]?.desktop || "center 30%"),
        mobile: focalMode === "mobile" ? pos : (prev[key]?.mobile || "center center"),
      }
    }));
  };

  const saveFocalPoint = async (key: string) => {
    setFocalSaving(key);
    try {
      await fetch("/api/focal-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, ...focal[key] }),
      });
    } catch {}
    setTimeout(() => setFocalSaving(null), 1500);
  };

  const getFocalPos = (key: string) => {
    const f = focal[key];
    if (!f) return focalMode === "mobile" ? "center center" : "center 30%";
    return focalMode === "mobile" ? f.mobile : f.desktop;
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${pwError ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
    color: "#ede8e0", borderRadius: "10px", padding: "14px 18px",
    fontSize: "0.9rem", outline: "none", width: "100%", fontFamily: "var(--font-body)",
  };

  // ── LOGIN ──
  if (!authed) return (
    <main className="bg-[#070707] text-[#ede8e0] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.45em] uppercase mb-2 text-center" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Admin</p>
        <h1 className="text-4xl font-light text-center mb-10" style={{ fontFamily: "var(--font-display)" }}>cryptic.frames</h1>
        <div className="space-y-4">
          <input type="password" placeholder="Password" value={pw}
            onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()}
            style={inputStyle} autoFocus />
          {pwError && <p className="text-xs text-red-400 text-center tracking-widest" style={{ fontFamily: "var(--font-body)" }}>Incorrect password</p>}
          <button onClick={login} className="w-full py-3 text-xs tracking-[0.3em] uppercase rounded-full hover:opacity-85 transition-opacity"
            style={{ background: "var(--accent)", color: "#070707", fontFamily: "var(--font-body)" }}>Enter</button>
        </div>
        <div className="text-center mt-8">
          <Link href="/" className="text-xs tracking-widest text-neutral-700 hover:text-neutral-500 uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>← Back to site</Link>
        </div>
      </div>
    </main>
  );

  const current = images[activeTab] || [];

  // ── DASHBOARD ──
  return (
    <main className="bg-[#070707] text-[#ede8e0] min-h-screen">

      {/* Header */}
      <div className="sticky top-0 z-40 px-5 md:px-10 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: "rgba(7,7,7,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Admin</p>
          <h1 className="text-xl font-light" style={{ fontFamily: "var(--font-display)" }}>cryptic.frames</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["reorder", "focal"] as AdminView[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-4 py-2 text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{
                  background: view === v ? "var(--accent)" : "transparent",
                  color: view === v ? "#070707" : "var(--muted)",
                  fontFamily: "var(--font-body)",
                }}>
                {v === "reorder" ? "Reorder" : "Focal Points"}
              </button>
            ))}
          </div>
          {view === "reorder" && (
            <button onClick={handleSaveOrder}
              className="px-5 py-2 text-[10px] tracking-widest uppercase rounded-full transition-all duration-200"
              style={{
                background: saved ? "transparent" : "var(--accent)",
                color: saved ? "var(--accent)" : "#070707",
                border: saved ? "1px solid var(--accent)" : "none",
                fontFamily: "var(--font-body)",
              }}>
              {saved ? "✓ Saved — Site Updated" : "Save Order"}
            </button>
          )}
          <button onClick={() => { loadImages(); loadFocal(); }} className="text-[10px] tracking-widest text-neutral-500 hover:text-white uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>Refresh</button>
          <Link href="/" className="text-[10px] tracking-widest text-neutral-500 hover:text-white uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>← Site</Link>
          <button onClick={() => { sessionStorage.removeItem("cf_admin"); setAuthed(false); }} className="text-[10px] tracking-widest text-neutral-700 hover:text-red-400 uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>Logout</button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-5 md:px-10 pt-5 pb-2 flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setActiveTab(cat); setFocalEditing(null); }}
            className="px-4 py-2 text-[10px] tracking-widest uppercase rounded-full transition-all duration-200"
            style={{
              background: activeTab === cat ? "var(--accent)" : "rgba(255,255,255,0.04)",
              color: activeTab === cat ? "#070707" : "#888",
              border: "1px solid", borderColor: activeTab === cat ? "var(--accent)" : "rgba(255,255,255,0.08)",
              fontFamily: "var(--font-body)",
            }}>
            {cat} {images[cat]?.length ? `(${images[cat].length})` : "(0)"}
          </button>
        ))}
      </div>

      {/* ── REORDER VIEW ── */}
      {view === "reorder" && (
        <div className="px-5 md:px-10 py-6 pb-20">
          <p className="text-[10px] text-neutral-700 mb-5 tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>
            Drag to reorder · First image becomes cover photo · Click Save to update site instantly
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-32 text-neutral-700">
              <p className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>Loading...</p>
            </div>
          ) : current.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-neutral-700">
              <p className="text-4xl mb-3">∅</p>
              <p className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>No images in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {current.map((img, idx) => (
                <div key={img} draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={e => onDragOver(e, idx)}
                  onDrop={e => onDrop(e, idx)}
                  onDragEnd={onDragEnd}
                  className="relative group overflow-hidden rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150"
                  style={{
                    opacity: dragIdx.current === idx ? 0.3 : 1,
                    outline: dragOverIdxState.current === idx && dragIdx.current !== idx ? "2px solid var(--accent)" : "2px solid transparent",
                    outlineOffset: "2px",
                  }}>
                  {/* Cover badge on first image */}
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] tracking-widest uppercase"
                      style={{ background: "var(--accent)", color: "#070707", fontFamily: "var(--font-body)" }}>
                      Cover
                    </div>
                  )}
                  <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
                    style={{ background: "rgba(7,7,7,0.8)", color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                    {idx + 1}
                  </div>
                  <img src={`/images/${activeTab}/${img}`} alt={img} draggable={false}
                    className="w-full aspect-square object-cover pointer-events-none" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-[9px] text-center text-[#c9a96e] tracking-widest" style={{ fontFamily: "var(--font-body)" }}>⠿ drag</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FOCAL POINT VIEW ── */}
      {view === "focal" && (
        <div className="px-5 md:px-10 py-6 pb-20">
          {/* Mode toggle */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["mobile", "desktop"] as const).map(m => (
                <button key={m} onClick={() => setFocalMode(m)}
                  className="px-5 py-2 text-[10px] tracking-widest uppercase transition-all duration-200"
                  style={{
                    background: focalMode === m ? "rgba(255,255,255,0.1)" : "transparent",
                    color: focalMode === m ? "white" : "var(--muted)",
                    fontFamily: "var(--font-body)",
                  }}>
                  {m === "mobile" ? "📱 Mobile" : "🖥 Desktop"}
                </button>
              ))}
            </div>
            <p className="text-[10px] tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
              Click on an image to set the focus point for {focalMode}
            </p>
          </div>

          {current.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-neutral-700">
              <p className="text-4xl mb-3">∅</p>
              <p className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>No images in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {current.map((img) => {
                const key = `${activeTab}/${img}`;
                const isEditing = focalEditing === key;
                const pos = getFocalPos(key);
                const isSaving = focalSaving === key;

                return (
                  <div key={img} className="space-y-3">
                    {/* Image with focal point overlay */}
                    <div className="relative overflow-hidden rounded-xl"
                      style={{ aspectRatio: "3/2", cursor: "crosshair" }}
                      onClick={e => { setFocalEditing(key); handleFocalClick(e, key); }}>
                      <img src={`/images/${activeTab}/${img}`} alt=""
                        className="w-full h-full object-cover transition-all duration-300"
                        style={{ objectPosition: pos }} draggable={false} />

                      {/* Crosshair indicator */}
                      {(() => {
                        const f = focal[key];
                        const currentPos = focalMode === "mobile" ? f?.mobile : f?.desktop;
                        if (!currentPos) return null;
                        const [xStr, yStr] = currentPos.split(" ");
                        const x = parseFloat(xStr);
                        const y = parseFloat(yStr);
                        return (
                          <div className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                              style={{ borderColor: "var(--accent)", background: "rgba(184,150,106,0.3)" }}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Click hint */}
                      {!focal[key] && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full"
                            style={{ background: "rgba(7,7,7,0.7)", color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                            Click to set focus
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Info + save */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] tracking-widest truncate max-w-[180px]"
                          style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>{img}</p>
                        {focal[key] && (
                          <p className="text-[9px] mt-0.5" style={{ color: "#444", fontFamily: "var(--font-body)" }}>
                            {focalMode}: {getFocalPos(key)}
                          </p>
                        )}
                      </div>
                      {focal[key] && (
                        <button onClick={() => saveFocalPoint(key)}
                          className="px-3 py-1.5 text-[9px] tracking-widest uppercase rounded-full transition-all duration-200"
                          style={{
                            background: isSaving ? "transparent" : "var(--accent)",
                            color: isSaving ? "var(--accent)" : "#070707",
                            border: isSaving ? "1px solid var(--accent)" : "none",
                            fontFamily: "var(--font-body)",
                          }}>
                          {isSaving ? "✓ Saved" : "Save"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
