"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street"];
const PASSWORD = "Hamilton2005!@#";
const STORAGE_KEY = "cf_image_order";

type ImageMap = Record<string, string[]>;

function saveOrder(order: ImageMap) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(order)); } catch {}
}
function loadOrder(): ImageMap {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [images, setImages] = useState<ImageMap>({});
  const [activeTab, setActiveTab] = useState("featured");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Drag state using refs to avoid re-renders during drag
  const dragIdx = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);
  const [, forceUpdate] = useState(0);
  const dragOverIdxState = useRef<number | null>(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    const fromServer: ImageMap = {};
    const res = await fetch("/images/manifest.json");
    const manifest = await res.json();
    for (const cat of CATEGORIES) {
      fromServer[cat] = manifest[cat] || [];
    }
    // Merge with saved order: keep saved order, append any new images not in saved
    const savedOrder = loadOrder();
    const merged: ImageMap = {};
    for (const cat of CATEGORIES) {
      const server = fromServer[cat] || [];
      const saved = savedOrder[cat] || [];
      // Start with saved order (only items still on server)
      const ordered = saved.filter((img) => server.includes(img));
      // Append any new images from server not yet in saved order
      for (const img of server) {
        if (!ordered.includes(img)) ordered.push(img);
      }
      merged[cat] = ordered;
    }
    setImages(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    const s = sessionStorage.getItem("cf_admin");
    if (s === PASSWORD) { setAuthed(true); loadImages(); }
  }, [loadImages]);

  const login = () => {
    if (pw === PASSWORD) {
      sessionStorage.setItem("cf_admin", pw);
      setAuthed(true);
      loadImages();
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

  const handleSaveOrder = () => {
    saveOrder(images);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetOrder = () => {
    localStorage.removeItem(STORAGE_KEY);
    loadImages();
  };

  // Drag handlers
  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragOverIdxState.current !== idx) {
      dragOverIdxState.current = idx;
      dragOverIdx.current = idx;
      forceUpdate((n) => n + 1);
    }
  };
  const onDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragIdx.current;
    if (fromIdx === null || fromIdx === toIdx) {
      dragIdx.current = null;
      dragOverIdx.current = null;
      dragOverIdxState.current = null;
      forceUpdate((n) => n + 1);
      return;
    }
    const list = [...(images[activeTab] || [])];
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    setImages((prev) => ({ ...prev, [activeTab]: list }));
    dragIdx.current = null;
    dragOverIdx.current = null;
    dragOverIdxState.current = null;
  };
  const onDragEnd = () => {
    dragIdx.current = null;
    dragOverIdx.current = null;
    dragOverIdxState.current = null;
    forceUpdate((n) => n + 1);
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${pwError ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
    color: "#ede8e0",
    borderRadius: "10px",
    padding: "14px 18px",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    fontFamily: "var(--font-body)",
    transition: "border-color 0.2s",
  };

  /* ── LOGIN SCREEN ── */
  if (!authed) return (
    <main className="bg-[#070707] text-[#ede8e0] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.45em] uppercase mb-2 text-center" style={{ color: "#c9a96e", fontFamily: "var(--font-body)" }}>
          Admin Access
        </p>
        <h1 className="text-4xl font-light text-center mb-10" style={{ fontFamily: "var(--font-display)" }}>
          cryptic.frames
        </h1>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={inputStyle}
            autoFocus
          />
          {pwError && (
            <p className="text-xs text-red-400 text-center tracking-widest" style={{ fontFamily: "var(--font-body)" }}>
              Incorrect password
            </p>
          )}
          <button
            onClick={login}
            className="w-full py-3 text-xs tracking-[0.3em] uppercase rounded-full transition-opacity hover:opacity-85"
            style={{ background: "#c9a96e", color: "#070707", fontFamily: "var(--font-body)" }}
          >
            Enter
          </button>
        </div>
        <div className="text-center mt-8">
          <Link href="/" className="text-xs tracking-widest text-neutral-700 hover:text-neutral-500 uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>
            ← Back to site
          </Link>
        </div>
      </div>
    </main>
  );

  const current = images[activeTab] || [];

  /* ── ADMIN DASHBOARD ── */
  return (
    <main className="bg-[#070707] text-[#ede8e0] min-h-screen">

      {/* Header */}
      <div className="sticky top-0 z-40 px-5 md:px-10 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: "rgba(7,7,7,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <p className="text-xs tracking-[0.4em] uppercase" style={{ color: "#c9a96e", fontFamily: "var(--font-body)" }}>Admin Dashboard</p>
          <h1 className="text-xl font-light" style={{ fontFamily: "var(--font-display)" }}>cryptic.frames</h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={handleSaveOrder}
            className="px-5 py-2 text-xs tracking-widest uppercase rounded-full transition-all duration-200"
            style={{
              background: saved ? "rgba(201,169,110,0.15)" : "#c9a96e",
              color: saved ? "#c9a96e" : "#070707",
              border: saved ? "1px solid #c9a96e" : "none",
              fontFamily: "var(--font-body)",
            }}
          >
            {saved ? "✓ Saved" : "Save Order"}
          </button>
          <button onClick={loadImages} className="text-xs tracking-widest text-neutral-500 hover:text-white uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>Refresh</button>
          <Link href="/" className="text-xs tracking-widest text-neutral-500 hover:text-white uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>← View site</Link>
          <button onClick={() => { sessionStorage.removeItem("cf_admin"); setAuthed(false); }} className="text-xs tracking-widest text-neutral-700 hover:text-red-400 uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>Logout</button>
        </div>
      </div>

      {/* Info banner */}
      <div className="px-5 md:px-10 py-3 flex items-start gap-3" style={{ background: "rgba(201,169,110,0.05)", borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
        <p className="text-xs text-neutral-500 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          <span style={{ color: "#c9a96e" }}>Add images:</span> drop files into <code className="text-neutral-400 bg-white/5 px-1 rounded">public/images/[category]/</code> then hit Refresh. &nbsp;
          <span style={{ color: "#c9a96e" }}>Remove:</span> delete from that folder. &nbsp;
          <span style={{ color: "#c9a96e" }}>Reorder:</span> drag thumbnails below, then click <strong>Save Order</strong> — order persists across sessions.
          <button onClick={handleResetOrder} className="ml-3 underline text-neutral-600 hover:text-neutral-400 transition-colors">Reset to default</button>
        </p>
      </div>

      {/* Category tabs */}
      <div className="px-5 md:px-10 pt-6 pb-2 flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className="px-4 py-2 text-xs tracking-widest uppercase rounded-full transition-all duration-200"
            style={{
              background: activeTab === cat ? "#c9a96e" : "rgba(255,255,255,0.04)",
              color: activeTab === cat ? "#070707" : "#888",
              border: "1px solid",
              borderColor: activeTab === cat ? "#c9a96e" : "rgba(255,255,255,0.08)",
              fontFamily: "var(--font-body)",
            }}
          >
            {cat} {images[cat]?.length ? `(${images[cat].length})` : "(0)"}
          </button>
        ))}
      </div>

      {/* Image grid */}
      <div className="px-5 md:px-10 py-6 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-neutral-700">
            <p className="text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>Loading...</p>
          </div>
        ) : current.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-700">
            <p className="text-5xl mb-4">∅</p>
            <p className="text-sm tracking-widest uppercase mb-2" style={{ fontFamily: "var(--font-body)" }}>No images in this category</p>
            <p className="text-xs text-neutral-800" style={{ fontFamily: "var(--font-body)" }}>Add files to public/images/{activeTab}/</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-neutral-700 mb-4 tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>
              Drag to reorder → click Save Order to persist
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {current.map((img, idx) => (
                <div
                  key={img}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDrop={(e) => onDrop(e, idx)}
                  onDragEnd={onDragEnd}
                  className="relative group overflow-hidden rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150"
                  style={{
                    opacity: dragIdx.current === idx ? 0.35 : 1,
                    outline: dragOverIdx.current === idx && dragIdx.current !== idx ? "2px solid #c9a96e" : "2px solid transparent",
                    outlineOffset: "2px",
                    transform: dragOverIdx.current === idx && dragIdx.current !== idx ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  {/* Position badge */}
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
                    style={{ background: "rgba(7,7,7,0.75)", color: "#c9a96e", fontFamily: "var(--font-body)", backdropFilter: "blur(4px)" }}>
                    {idx + 1}
                  </div>

                  <img
                    src={`/images/${activeTab}/${img}`}
                    alt={img}
                    draggable={false}
                    className="w-full aspect-square object-cover pointer-events-none"
                  />

                  {/* Hover info */}
                  <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 p-2">
                    <p className="text-[9px] text-center text-white/70 leading-snug break-all px-1" style={{ fontFamily: "var(--font-body)" }}>{img}</p>
                    <p className="text-[9px] text-[#c9a96e] tracking-widest" style={{ fontFamily: "var(--font-body)" }}>⠿ drag to reorder</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
