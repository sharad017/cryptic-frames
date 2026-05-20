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

  const dragIdx = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);
  const [, forceUpdate] = useState(0);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/images/manifest.json?t=" + Date.now());
      const manifest = await res.json();
      const merged: ImageMap = {};
      for (const cat of CATEGORIES) merged[cat] = manifest[cat] || [];
      setImages(merged);
    } catch { }
    setLoading(false);
  }, []);

  const loadFocal = useCallback(async () => {
    try {
      const res = await fetch("/images/focal-points.json?t=" + Date.now());
      setFocal(await res.json());
    } catch { }
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

  // ── Drag reorder ──
  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragOverIdx.current !== idx) { dragOverIdx.current = idx; forceUpdate(n => n + 1); }
  };
  const onDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragIdx.current;
    if (fromIdx === null || fromIdx === toIdx) { dragIdx.current = null; dragOverIdx.current = null; forceUpdate(n => n + 1); return; }
    const list = [...(images[activeTab] || [])];
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    setImages(prev => ({ ...prev, [activeTab]: list }));
    dragIdx.current = null; dragOverIdx.current = null;
  };
  const onDragEnd = () => { dragIdx.current = null; dragOverIdx.current = null; forceUpdate(n => n + 1); };

  // ── Save order via GitHub API ──
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
    } catch (err) {
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
        body: JSON.stringify({ type: "focal", data: { key, ...focal[key] } }),
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
    <main className="bg-[#070707] text-[#ede8e0] min-h-screen flex items-center justify-center px-6">
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

      {/* Save status message */}
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

      {/* ── REORDER VIEW ── */}
      {view === "reorder" && (
        <div className="px-5 md:px-10 py-6 pb-20">
          <p className="text-[10px] text-neutral-700 mb-5 tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>
            Drag to reorder · First image = cover photo · Save to update live site
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-32"><div className="w-6 h-6 rounded-full border-t animate-spin" style={{ borderColor: "var(--accent)" }} /></div>
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
                    outline: dragOverIdx.current === idx && dragIdx.current !== idx ? "2px solid var(--accent)" : "2px solid transparent",
                    outlineOffset: "2px",
                  }}>
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] tracking-widest uppercase"
                      style={{ background: "var(--accent)", color: "#070707", fontFamily: "var(--font-body)" }}>Cover</div>
                  )}
                  <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
                    style={{ background: "rgba(7,7,7,0.8)", color: "var(--accent)", fontFamily: "var(--font-body)" }}>{idx + 1}</div>
                  <img src={`/images/${activeTab}/${img}`} alt="" draggable={false} className="w-full aspect-square object-cover pointer-events-none" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-[9px] text-[#c9a96e] tracking-widest" style={{ fontFamily: "var(--font-body)" }}>⠿ drag</p>
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
          {/* Mode toggle + instructions */}
          <div className="flex items-start gap-6 mb-8 flex-wrap">
            <div className="flex rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["mobile", "desktop"] as const).map(m => (
                <button key={m} onClick={() => setFocalMode(m)}
                  className="px-5 py-2 text-[10px] tracking-widest uppercase transition-all"
                  style={{ background: focalMode === m ? "rgba(255,255,255,0.1)" : "transparent", color: focalMode === m ? "white" : "var(--muted)", fontFamily: "var(--font-body)" }}>
                  {m === "mobile" ? "📱 Mobile" : "🖥 Desktop"}
                </button>
              ))}
            </div>
            <p className="text-[10px] leading-loose max-w-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
              Click anywhere on an image to place the focus point. The preview shows exactly how it will crop on that device. Set both mobile and desktop, then save.
            </p>
          </div>

          {current.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-neutral-700">
              <p className="text-4xl mb-3">∅</p>
              <p className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>No images</p>
            </div>
          ) : (
            <div className="space-y-12">
              {current.map((img) => {
                const key = `${activeTab}/${img}`;
                const status = focalSaving[key] || "idle";
                const mobilePos = getFocalPos(key, "mobile");
                const desktopPos = getFocalPos(key, "desktop");

                return (
                  <div key={img} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="p-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-[10px] tracking-widest truncate" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>{img}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-[9px]" style={{ color: "#333", fontFamily: "var(--font-body)" }}>
                          Mobile: {focal[key]?.mobile || "not set"} · Desktop: {focal[key]?.desktop || "not set"}
                        </p>
                        <button onClick={() => saveFocalPoint(key)} disabled={status === "saving"}
                          className="px-4 py-1.5 text-[9px] tracking-widest uppercase rounded-full transition-all"
                          style={{
                            background: btnColor(status).bg,
                            color: btnColor(status).color,
                            border: btnColor(status).border || "none",
                            fontFamily: "var(--font-body)",
                          }}>
                          {status === "idle" && "Save"}
                          {status === "saving" && "Saving..."}
                          {status === "success" && "✓ Saved — deploying"}
                          {status === "error" && "✗ Failed"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      {/* Click area — natural image ratio, no forced crop */}
                      <div className="p-4">
                        <p className="text-[9px] tracking-widest uppercase mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                          Click to set {focalMode} focus point
                        </p>
                        <div className="relative rounded-xl overflow-hidden"
                          style={{ cursor: "crosshair", display: "inline-block", width: "100%" }}
                          onClick={e => handleFocalClick(e, key)}>
                          {/* Image at natural ratio — no forced aspectRatio */}
                          <img src={`/images/${activeTab}/${img}`} alt=""
                            className="w-full h-auto block pointer-events-none select-none"
                            draggable={false} />
                          {/* Crosshair overlay */}
                          {(() => {
                            const pos = focalMode === "mobile" ? focal[key]?.mobile : focal[key]?.desktop;
                            if (!pos) return (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <p className="text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full"
                                  style={{ background: "rgba(7,7,7,0.7)", color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                                  Click to set focus
                                </p>
                              </div>
                            );
                            const [xStr, yStr] = pos.split(" ");
                            return (
                              <div className="absolute pointer-events-none" style={{ left: xStr, top: yStr, transform: "translate(-50%, -50%)" }}>
                                <div className="absolute" style={{ width: "48px", height: "1px", background: "var(--accent)", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
                                <div className="absolute" style={{ width: "1px", height: "48px", background: "var(--accent)", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
                                <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: "var(--accent)", background: "rgba(184,150,106,0.35)" }} />
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Live previews — correct ratios per use case */}
                      <div className="p-4 space-y-5">
                        <p className="text-[9px] tracking-widest uppercase" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                          Live preview — how it crops on site
                        </p>

                        {/* Mobile preview */}
                        <div>
                          <p className="text-[9px] mb-2" style={{ color: "#555", fontFamily: "var(--font-body)" }}>
                            📱 Mobile — {activeTab === "featured" ? "hero (full screen)" : "category card"}
                          </p>
                          <div className="overflow-hidden rounded-lg"
                            style={{ aspectRatio: activeTab === "featured" ? "9/16" : "3/2", maxWidth: activeTab === "featured" ? "100px" : "220px" }}>
                            <img src={`/images/${activeTab}/${img}`} alt="" className="w-full h-full object-cover"
                              style={{ objectPosition: mobilePos }} draggable={false} />
                          </div>
                        </div>

                        {/* Desktop preview */}
                        <div>
                          <p className="text-[9px] mb-2" style={{ color: "#555", fontFamily: "var(--font-body)" }}>
                            🖥 Desktop — {activeTab === "featured" ? "hero (wide)" : "category card"}
                          </p>
                          <div className="overflow-hidden rounded-lg"
                            style={{ aspectRatio: activeTab === "featured" ? "21/9" : "4/3", maxWidth: "280px" }}>
                            <img src={`/images/${activeTab}/${img}`} alt="" className="w-full h-full object-cover"
                              style={{ objectPosition: desktopPos }} draggable={false} />
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
