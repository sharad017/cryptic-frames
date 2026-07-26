"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street", "product"];
const PASSWORD = "Hamilton2005!@#";

type ImageMap = Record<string, string[]>;
type FocalPoint = { desktop: string; mobile: string };
type FocalMap = Record<string, FocalPoint>;
type AdminView = "reorder" | "focal";
type SaveStatus = "idle" | "saving" | "success" | "error";

// ── Masonry column distributor ──
function buildColumns(items: string[], cols: number): string[][] {
  const columns: string[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [images, setImages] = useState<ImageMap>({});
  const [activeTab, setActiveTab] = useState("featured");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMsg, setSaveMsg] = useState("");
  const [view, setView] = useState<AdminView>("reorder");
  const [focal, setFocal] = useState<FocalMap>({});
  const [focalSaving, setFocalSaving] = useState<Record<string, SaveStatus>>({});
  const [focalMode, setFocalMode] = useState<"desktop" | "mobile">("mobile");
  const [focalZoom, setFocalZoom] = useState<Record<string, number>>({});
  const getZoom = (key: string, mode: "mobile" | "desktop") => focalZoom[`${key}__${mode}`] || 1;
  const setZoom = (key: string, mode: "mobile" | "desktop", val: number) =>
    setFocalZoom(prev => ({ ...prev, [`${key}__${mode}`]: val }));

  // Drag state — track by flat index
  const dragSrc = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const [dragState, setDragState] = useState<{ src: number | null; over: number | null }>({ src: null, over: null });

  // Column count toggle — 2 / 3 / 4
  const [cols, setCols] = useState(3);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const [manifestRes, orderRes] = await Promise.all([
        fetch("/images/manifest.json?t=" + Date.now()),
        fetch("/images/order.json?t=" + Date.now()),
      ]);
      const manifest = await manifestRes.json();
      let order: ImageMap = {};
      try { order = await orderRes.json(); } catch {}
      const merged: ImageMap = {};
      for (const cat of CATEGORIES) {
        const all: string[] = manifest[cat] || [];
        const saved: string[] = order[cat] || [];
        if (saved.length === 0) { merged[cat] = all; continue; }
        const ordered = saved.filter((f: string) => all.includes(f));
        for (const f of all) { if (!ordered.includes(f)) ordered.push(f); }
        merged[cat] = ordered;
      }
      setImages(merged);
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
      setAuthed(true); loadImages(); loadFocal();
    } else { setPwError(true); setTimeout(() => setPwError(false), 2000); }
  };

  // ── Drag reorder — works on flat list ──
  const onDragStart = (flatIdx: number) => {
    dragSrc.current = flatIdx;
    setDragState({ src: flatIdx, over: dragOver.current });
  };

  const onDragOver = (e: React.DragEvent, flatIdx: number) => {
    e.preventDefault();
    if (dragOver.current !== flatIdx) {
      dragOver.current = flatIdx;
      setDragState({ src: dragSrc.current, over: flatIdx });
    }
  };

  const onDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragSrc.current;
    if (fromIdx === null || fromIdx === toIdx) {
      dragSrc.current = null; dragOver.current = null;
      setDragState({ src: null, over: null });
      return;
    }
    const list = [...(images[activeTab] || [])];
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    setImages(prev => ({ ...prev, [activeTab]: list }));
    dragSrc.current = null; dragOver.current = null;
    setDragState({ src: null, over: null });
  };

  const onDragEnd = () => {
    dragSrc.current = null; dragOver.current = null;
    setDragState({ src: null, over: null });
  };

  // ── Save order ──
  const handleSaveOrder = async () => {
    setSaveStatus("saving"); setSaveMsg("Committing to GitHub...");
    try {
      const res = await fetch("/api/github-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "reorder", category: activeTab, data: images[activeTab] || [] }),
      });
      const result = await res.json();
      if (result.success) {
        setSaveStatus("success");
        setSaveMsg("✓ Saved — site will update in ~60 seconds");
        setTimeout(() => { setSaveStatus("idle"); setSaveMsg(""); }, 10000);
      } else {
        setSaveStatus("error");
        setSaveMsg("Error: " + (result.error || "Unknown error"));
        setTimeout(() => { setSaveStatus("idle"); setSaveMsg(""); }, 6000);
      }
    } catch {
      setSaveStatus("error");
      setSaveMsg("Network error — check console");
      setTimeout(() => { setSaveStatus("idle"); setSaveMsg(""); }, 6000);
    }
  };

  // ── Focal point ──
  const handleFocalClick = (e: React.MouseEvent<HTMLDivElement>, key: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const pos = `${x}% ${y}%`;
    setFocal(prev => ({
      ...prev,
      [key]: {
        desktop: focalMode === "desktop" ? pos : (prev[key]?.desktop || "50% 30%"),
        mobile: focalMode === "mobile" ? pos : (prev[key]?.mobile || "50% 50%"),
      }
    }));
  };

  const saveFocalPoint = async (key: string) => {
    setFocalSaving(prev => ({ ...prev, [key]: "saving" }));
    try {
      const res = await fetch("/api/github-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "focal", data: {
          key, ...focal[key],
          mobileZoom: getZoom(key, "mobile"),
          desktopZoom: getZoom(key, "desktop"),
        } }),
      });
      const result = await res.json();
      if (result.success) {
        setFocalSaving(prev => ({ ...prev, [key]: "success" }));
        setTimeout(() => setFocalSaving(prev => ({ ...prev, [key]: "idle" })), 5000);
      } else {
        setFocalSaving(prev => ({ ...prev, [key]: "error" }));
        setTimeout(() => setFocalSaving(prev => ({ ...prev, [key]: "idle" })), 4000);
      }
    } catch {
      setFocalSaving(prev => ({ ...prev, [key]: "error" }));
      setTimeout(() => setFocalSaving(prev => ({ ...prev, [key]: "idle" })), 4000);
    }
  };

  const getFocalPos = (key: string, mode: "desktop" | "mobile") => {
    const f = focal[key];
    if (!f) return mode === "mobile" ? "50% 50%" : "50% 30%";
    return mode === "mobile" ? (f.mobile || "50% 50%") : (f.desktop || "50% 30%");
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", border: `1px solid ${pwError ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
    color: "#ede8e0", borderRadius: "10px", padding: "14px 18px", fontSize: "0.9rem",
    outline: "none", width: "100%", fontFamily: "var(--font-body)",
  };

  const btnColor = (status: SaveStatus) => {
    if (status === "success") return { bg: "transparent", color: "#4ade80", border: "1px solid #4ade80" };
    if (status === "error") return { bg: "transparent", color: "#ef4444", border: "1px solid #ef4444" };
    if (status === "saving") return { bg: "rgba(184,150,106,0.3)", color: "var(--accent)", border: "none" };
    return { bg: "var(--accent)", color: "#070707", border: "none" };
  };

  // ── LOGIN ──
  if (!authed) return (
    <main className="bg-[#0a0a0a] text-[#ede8e0] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-[10px] tracking-[0.45em] uppercase mb-2 text-center" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Admin</p>
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
  const columns = buildColumns(current, cols);

  return (
    <main className="bg-[#0a0a0a] text-[#ede8e0] min-h-screen">

      {/* Header */}
      <div className="sticky top-0 z-40 px-5 md:px-10 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: "rgba(10,10,10,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Admin v2</p>
          <h1 className="text-xl font-light" style={{ fontFamily: "var(--font-display)" }}>cryptic.frames</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["reorder", "focal"] as AdminView[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-4 py-2 text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{ background: view === v ? "var(--accent)" : "transparent", color: view === v ? "#070707" : "var(--muted)", fontFamily: "var(--font-body)" }}>
                {v === "reorder" ? "Reorder" : "Focal Points"}
              </button>
            ))}
          </div>
          {view === "reorder" && (
            <button onClick={handleSaveOrder} disabled={saveStatus === "saving"}
              className="px-5 py-2 text-[10px] tracking-widest uppercase rounded-full transition-all duration-200"
              style={{ background: btnColor(saveStatus).bg, color: btnColor(saveStatus).color, border: btnColor(saveStatus).border, fontFamily: "var(--font-body)" }}>
              {saveStatus === "idle" && "Save Order"}
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "success" && "✓ Saved"}
              {saveStatus === "error" && "✗ Failed"}
            </button>
          )}
          <button onClick={() => { loadImages(); loadFocal(); }} className="text-[10px] tracking-widest text-neutral-500 hover:text-white uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>Refresh</button>
          <Link href="/" target="_blank" className="text-[10px] tracking-widest text-neutral-500 hover:text-white uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>View Site ↗</Link>
          <button onClick={() => { sessionStorage.removeItem("cf_admin"); setAuthed(false); }} className="text-[10px] tracking-widest text-neutral-700 hover:text-red-400 uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>Logout</button>
        </div>
      </div>

      {saveMsg && (
        <div className="px-5 md:px-10 py-3 text-xs" style={{
          background: saveStatus === "error" ? "rgba(239,68,68,0.08)" : "rgba(74,222,128,0.08)",
          borderBottom: `1px solid ${saveStatus === "error" ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.2)"}`,
          color: saveStatus === "error" ? "#ef4444" : "#4ade80",
          fontFamily: "var(--font-body)"
        }}>{saveMsg}</div>
      )}

      {/* Category tabs */}
      <div className="px-5 md:px-10 pt-5 pb-2 flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveTab(cat)}
            className="px-4 py-2 text-[10px] tracking-widest uppercase rounded-full transition-all duration-200"
            style={{
              background: activeTab === cat ? "var(--accent)" : "rgba(255,255,255,0.04)",
              color: activeTab === cat ? "#070707" : "#888",
              border: "1px solid", borderColor: activeTab === cat ? "var(--accent)" : "rgba(255,255,255,0.08)",
              fontFamily: "var(--font-body)",
            }}>
            {cat} ({images[cat]?.length || 0})
          </button>
        ))}
      </div>

      {/* ── REORDER VIEW — masonry preview ── */}
      {view === "reorder" && (
        <div className="px-5 md:px-10 py-6 pb-20">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-[10px] text-neutral-600 tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>
              Drag to reorder · First image = cover · Save to update live site
            </p>
            {/* Column density toggle */}
            <div className="flex items-center gap-2">
              <p className="text-[9px] tracking-widest uppercase" style={{ color: "#4a4a4a", fontFamily: "var(--font-body)" }}>Columns</p>
              <div className="flex rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                {[2, 3, 4].map(c => (
                  <button key={c} onClick={() => setCols(c)}
                    className="w-8 h-7 text-[10px] transition-all duration-200"
                    style={{
                      background: cols === c ? "rgba(255,255,255,0.12)" : "transparent",
                      color: cols === c ? "white" : "#555",
                      fontFamily: "var(--font-body)",
                    }}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-6 h-6 rounded-full border-t animate-spin" style={{ borderColor: "var(--accent)" }} />
            </div>
          ) : current.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-neutral-700">
              <p className="text-4xl mb-3">∅</p>
              <p className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>No images in this category</p>
            </div>
          ) : (
            /* ── Masonry grid — actual aspect ratios ── */
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "6px", alignItems: "start" }}>
              {columns.map((col, colIdx) => (
                <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {col.map((img) => {
                    const flatIdx = current.indexOf(img);
                    const isSrc = dragState.src === flatIdx;
                    const isOver = dragState.over === flatIdx && dragState.src !== flatIdx;

                    return (
                      <div
                        key={img}
                        draggable
                        onDragStart={() => onDragStart(flatIdx)}
                        onDragOver={e => onDragOver(e, flatIdx)}
                        onDrop={e => onDrop(e, flatIdx)}
                        onDragEnd={onDragEnd}
                        className="relative group overflow-hidden rounded-lg"
                        style={{
                          cursor: "grab",
                          opacity: isSrc ? 0.25 : 1,
                          outline: isOver ? "2px solid var(--accent)" : "2px solid transparent",
                          outlineOffset: "2px",
                          transition: "opacity 0.15s, outline 0.1s",
                        }}
                      >
                        {/* Cover badge */}
                        {flatIdx === 0 && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[8px] tracking-widest uppercase"
                            style={{ background: "var(--accent)", color: "#070707", fontFamily: "var(--font-body)" }}>
                            Cover
                          </div>
                        )}

                        {/* Position number */}
                        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
                          style={{ background: "rgba(10,10,10,0.85)", color: isOver ? "var(--accent)" : "#666", fontFamily: "var(--font-body)" }}>
                          {flatIdx + 1}
                        </div>

                        {/* Image — natural aspect ratio */}
                        <img
                          src={`/images/${activeTab}/${img}`}
                          alt=""
                          draggable={false}
                          className="w-full h-auto block pointer-events-none select-none"
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                          style={{ background: "rgba(10,10,10,0.45)" }}>
                          <p className="text-[10px] tracking-widest" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>⠿ drag</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FOCAL POINT VIEW — identical to current admin ── */}
      {view === "focal" && (
        <div className="px-5 md:px-10 py-6 pb-20">
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <div className="flex rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["mobile", "desktop"] as const).map(m => (
                <button key={m} onClick={() => setFocalMode(m)}
                  className="px-5 py-2 text-[10px] tracking-widest uppercase transition-all"
                  style={{ background: focalMode === m ? "rgba(255,255,255,0.1)" : "transparent", color: focalMode === m ? "white" : "var(--muted)", fontFamily: "var(--font-body)" }}>
                  {m === "mobile" ? "📱 Mobile" : "🖥 Desktop"}
                </button>
              ))}
            </div>
            <p className="text-[10px]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
              Click image to set focus · scroll to zoom · copy button mirrors to other device
            </p>
          </div>

          {current.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-neutral-700">
              <p className="text-4xl mb-3">∅</p>
              <p className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>No images</p>
            </div>
          ) : (
            <div className="space-y-10">
              {current.map((img) => {
                const key = `${activeTab}/${img}`;
                const status = focalSaving[key] || "idle";
                const mobilePos = getFocalPos(key, "mobile");
                const desktopPos = getFocalPos(key, "desktop");
                const zoom = getZoom(key, focalMode);
                const copyToDesktop = () => setFocal(prev => ({ ...prev, [key]: { ...prev[key], desktop: prev[key]?.mobile || "50% 50%" } }));
                const copyToMobile = () => setFocal(prev => ({ ...prev, [key]: { ...prev[key], mobile: prev[key]?.desktop || "50% 30%" } }));

                return (
                  <div key={img} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
                    <div className="p-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-[10px] tracking-widest truncate max-w-[200px]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>{img}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={copyToDesktop} className="transition-all duration-200 hover:text-white"
                          style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px", background: "transparent" }}>
                          Mobile → Desktop
                        </button>
                        <button onClick={copyToMobile} className="transition-all duration-200 hover:text-white"
                          style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px", background: "transparent" }}>
                          Desktop → Mobile
                        </button>
                        <button onClick={() => saveFocalPoint(key)} disabled={status === "saving"}
                          className="px-4 py-1.5 text-[9px] tracking-widest uppercase rounded-full transition-all"
                          style={{ background: btnColor(status).bg, color: btnColor(status).color, border: btnColor(status).border || "none", fontFamily: "var(--font-body)" }}>
                          {status === "idle" && "Save"}{status === "saving" && "Saving..."}{status === "success" && "✓ Saved"}{status === "error" && "✗ Failed"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                      <div className="p-4 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[9px] tracking-widest uppercase" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                            Setting: {focalMode === "mobile" ? "📱 Mobile" : "🖥 Desktop"} focus
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px]" style={{ color: "#444", fontFamily: "var(--font-body)" }}>Zoom</p>
                            <input type="range" min="1" max="3" step="0.05" value={getZoom(key, focalMode)}
                              onChange={e => setZoom(key, focalMode, parseFloat(e.target.value))}
                              style={{ width: "80px", accentColor: "var(--accent)" }} />
                            <p className="text-[9px] w-8" style={{ color: "#444", fontFamily: "var(--font-body)" }}>{getZoom(key, focalMode).toFixed(2)}x</p>
                          </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl" style={{ cursor: "crosshair", maxHeight: "420px" }} onClick={e => handleFocalClick(e, key)}>
                          <div style={{ transform: `scale(${zoom})`, transformOrigin: (() => { const pos = focalMode === "mobile" ? focal[key]?.mobile : focal[key]?.desktop; return pos || "center center"; })(), transition: "transform 0.2s ease" }}>
                            <img src={`/images/${activeTab}/${img}`} alt="" className="w-full h-auto block pointer-events-none select-none" draggable={false} />
                          </div>
                          {(() => {
                            const pos = focalMode === "mobile" ? focal[key]?.mobile : focal[key]?.desktop;
                            if (!pos) return (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <p className="text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full" style={{ background: "rgba(10,10,10,0.8)", color: "var(--accent)", fontFamily: "var(--font-body)" }}>Click to set focus point</p>
                              </div>
                            );
                            const [xStr, yStr] = pos.split(" ");
                            return (
                              <div className="absolute pointer-events-none" style={{ left: xStr, top: yStr, transform: "translate(-50%, -50%)" }}>
                                <div style={{ position: "absolute", width: "50px", height: "1px", background: "var(--accent)", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
                                <div style={{ position: "absolute", width: "1px", height: "50px", background: "var(--accent)", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
                                <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: "var(--accent)", background: "rgba(184,150,106,0.3)" }} />
                              </div>
                            );
                          })()}
                        </div>
                        <p className="text-[9px] mt-2" style={{ color: "#2a2a2a", fontFamily: "var(--font-body)" }}>
                          Mobile: {focal[key]?.mobile || "not set"} · Desktop: {focal[key]?.desktop || "not set"}
                        </p>
                      </div>

                      <div className="p-4 space-y-6">
                        <p className="text-[9px] tracking-widest uppercase" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Live preview — exactly how it appears on site</p>
                        <div>
                          <p className="text-[9px] mb-2" style={{ color: "#555", fontFamily: "var(--font-body)" }}>📱 {activeTab === "featured" ? "Hero — mobile" : "Category card — mobile"}</p>
                          <div className="overflow-hidden rounded-lg inline-block" style={{ aspectRatio: activeTab === "featured" ? "9/19.5" : "3/2", width: activeTab === "featured" ? "90px" : "200px" }}>
                            <img src={`/images/${activeTab}/${img}`} alt="" className="w-full h-full object-cover"
                              style={{ objectPosition: mobilePos, transform: `scale(${getZoom(key, "mobile")})`, transformOrigin: mobilePos, transition: "transform 0.2s ease, object-position 0.2s ease" }} draggable={false} />
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] mb-2" style={{ color: "#555", fontFamily: "var(--font-body)" }}>🖥 {activeTab === "featured" ? "Hero — desktop" : "Category card — desktop"}</p>
                          <div className="overflow-hidden rounded-lg inline-block" style={{ aspectRatio: activeTab === "featured" ? "21/9" : "4/3", width: activeTab === "featured" ? "280px" : "240px", maxWidth: "100%" }}>
                            <img src={`/images/${activeTab}/${img}`} alt="" className="w-full h-full object-cover"
                              style={{ objectPosition: desktopPos, transform: `scale(${getZoom(key, "desktop")})`, transformOrigin: desktopPos, transition: "transform 0.2s ease, object-position 0.2s ease" }} draggable={false} />
                          </div>
                        </div>
                      </div>
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
