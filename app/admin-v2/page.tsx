"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street", "product"];
const PASSWORD = "Hamilton2005!@#";

type ImageMap = Record<string, string[]>;
type FocalPoint = { desktop: string; mobile: string };
type FocalMap = Record<string, FocalPoint>;
type AdminView = "reorder" | "focal" | "about";
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
  const [focalZoom, setFocalZoom] = useState<Record<string, number>>({});
  const getZoom = (key: string, mode: "mobile" | "desktop") => focalZoom[`${key}__${mode}`] || 1;

  // About content state
  const [aboutContent, setAboutContent] = useState({
    bio1: "Self-taught. Six genres. Drawn to moments that exist for a fraction of a second — whether that's a peacock mid-display or a guitarist lost in the set.",
    bio2: "In college, I joined Confluenz — GGSIPU's student photography collective — and spent a year covering everything from intimate portrait sessions to high-energy concert pits. That year compressed what might have taken five.",
    bio3: "Currently based in Delhi. Open to work across India and beyond.",
    stat1num: "6", stat1label: "Genres",
    stat2num: "2023", stat2label: "Since",
    stat3num: "Delhi", stat3label: "Based in",
    stat4num: "∞", stat4label: "Frames left",
    notable1artist: "Silver Lining", notable1venue: "Piano Man Jazz Club, Gurgaon",
    notable2artist: "Desmadre Orchestra", notable2venue: "Piano Man, Eldeco Centre, Malviya Nagar",
    gear1kind: "Body", gear1item: "Sony A6600",
    gear2kind: "Lens", gear2item: "Sony E PZ 18-105mm F4 G OSS",
  });
  const [aboutSaveStatus, setAboutSaveStatus] = useState<SaveStatus>("idle");
  const [aboutSaveMsg, setAboutSaveMsg] = useState("");
  const setZoom = (key: string, mode: "mobile" | "desktop", val: number) =>
    setFocalZoom(prev => ({ ...prev, [`${key}__${mode}`]: val }));

  // Drag state
  const dragSrc = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const dragOverCol = useRef<number | null>(null);
  const [dragState, setDragState] = useState<{ src: number | null; over: number | null }>({ src: null, over: null });

  // Column count toggle — 2 / 3 / 4
  const [cols, setCols] = useState(3);

  // Swap mode — click first image, click second to swap
  const [swapSrc, setSwapSrc] = useState<number | null>(null);

  // Column move menu — right-click an image to move it to a specific column
  const [colMenu, setColMenu] = useState<{ flatIdx: number; x: number; y: number } | null>(null);

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

  const loadAboutContent = useCallback(async () => {
    try {
      const res = await fetch("/images/about-content.json?t=" + Date.now());
      const data = await res.json();
      setAboutContent(prev => ({ ...prev, ...data }));
    } catch {}
  }, []);

  useEffect(() => {
    const s = sessionStorage.getItem("cf_admin");
    if (s === PASSWORD) { setAuthed(true); loadImages(); loadFocal(); loadAboutContent(); }
  }, [loadImages, loadFocal, loadAboutContent]);

  const login = () => {
    if (pw === PASSWORD) {
      sessionStorage.setItem("cf_admin", pw);
      setAuthed(true); loadImages(); loadFocal();
    } else { setPwError(true); setTimeout(() => setPwError(false), 2000); }
  };

  // ── Drag handlers ──
  const onDragStart = (flatIdx: number) => {
    dragSrc.current = flatIdx;
    dragOverItem.current = null;
    dragOverCol.current = null;
    setDragState({ src: flatIdx, over: null });
  };

  const onDragOverItem = (e: React.DragEvent, flatIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverItem.current !== flatIdx) {
      dragOverItem.current = flatIdx;
      dragOverCol.current = null;
      setDragState({ src: dragSrc.current, over: flatIdx });
    }
  };

  const onDropItem = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const fromIdx = dragSrc.current;
    if (fromIdx === null || fromIdx === toIdx) {
      dragSrc.current = null; dragOverItem.current = null; dragOverCol.current = null;
      setDragState({ src: null, over: null });
      return;
    }
    const list = [...(images[activeTab] || [])];
    const [item] = list.splice(fromIdx, 1);
    // Adjust toIdx after splice
    const adjustedTo = fromIdx < toIdx ? toIdx - 1 : toIdx;
    list.splice(adjustedTo, 0, item);
    setImages(prev => ({ ...prev, [activeTab]: list }));
    dragSrc.current = null; dragOverItem.current = null; dragOverCol.current = null;
    setDragState({ src: null, over: null });
  };

  // Drop on column empty space — insert at the position that puts image in that column
  const onDragOverColumn = (e: React.DragEvent, colIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol.current !== colIdx) {
      dragOverCol.current = colIdx;
      dragOverItem.current = null;
      setDragState(prev => ({ ...prev, over: null }));
    }
  };

  const onDropColumn = (e: React.DragEvent, targetColIdx: number) => {
    e.preventDefault();
    const fromIdx = dragSrc.current;
    if (fromIdx === null) return;

    const list = [...(images[activeTab] || [])];
    const [item] = list.splice(fromIdx, 1);

    // After removing item, find the best insert position:
    // We want the image to appear in targetColIdx.
    // In a cols-column grid, position i goes to column i % cols.
    // Find the insert position closest to fromIdx that maps to targetColIdx.
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i <= list.length; i++) {
      if (i % cols === targetColIdx) {
        const dist = Math.abs(i - fromIdx);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
    }
    if (bestIdx === -1) bestIdx = list.length;

    list.splice(bestIdx, 0, item);
    setImages(prev => ({ ...prev, [activeTab]: list }));
    dragSrc.current = null; dragOverItem.current = null; dragOverCol.current = null;
    setDragState({ src: null, over: null });
  };

  const onDragEnd = () => {
    dragSrc.current = null; dragOverItem.current = null; dragOverCol.current = null;
    setDragState({ src: null, over: null });
  };

  // ── Swap handler ──
  const handleSwapClick = (flatIdx: number) => {
    if (swapSrc === null) {
      // First click — select source
      setSwapSrc(flatIdx);
    } else if (swapSrc === flatIdx) {
      // Clicked same image — deselect
      setSwapSrc(null);
    } else {
      // Second click — do the swap
      const list = [...(images[activeTab] || [])];
      [list[swapSrc], list[flatIdx]] = [list[flatIdx], list[swapSrc]];
      setImages(prev => ({ ...prev, [activeTab]: list }));
      setSwapSrc(null);
    }
  };

  // ── Move to column ──
  // Strategy: swap the selected image with the image currently occupying
  // the nearest slot in the target column. This keeps the total count
  // the same and doesn't shift anything else.
  const moveToColumn = (fromIdx: number, targetCol: number) => {
    const list = [...(images[activeTab] || [])];
    const currentCol = fromIdx % cols;
    if (currentCol === targetCol) { setColMenu(null); return; }

    // Find all indices in the target column
    const targetIndices = list
      .map((_, i) => i)
      .filter(i => i % cols === targetCol);

    if (targetIndices.length === 0) { setColMenu(null); return; }

    // Find the closest index in the target column to fromIdx
    const closestTargetIdx = targetIndices.reduce((best, idx) =>
      Math.abs(idx - fromIdx) < Math.abs(best - fromIdx) ? idx : best
    , targetIndices[0]);

    // Simple swap — no shifting, no index math side effects
    [list[fromIdx], list[closestTargetIdx]] = [list[closestTargetIdx], list[fromIdx]];

    setImages(prev => ({ ...prev, [activeTab]: list }));
    setColMenu(null);
    setSwapSrc(null);
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

  // ── Save about content ──
  const handleSaveAbout = async () => {
    setAboutSaveStatus("saving");
    setAboutSaveMsg("Saving about content...");
    try {
      const res = await fetch("/api/github-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "about", data: aboutContent }),
      });
      const result = await res.json();
      if (result.success) {
        setAboutSaveStatus("success");
        setAboutSaveMsg("✓ Saved — about page will update in ~60 seconds");
        setTimeout(() => { setAboutSaveStatus("idle"); setAboutSaveMsg(""); }, 10000);
      } else {
        setAboutSaveStatus("error");
        setAboutSaveMsg("Error: " + (result.error || "Unknown"));
        setTimeout(() => { setAboutSaveStatus("idle"); setAboutSaveMsg(""); }, 6000);
      }
    } catch {
      setAboutSaveStatus("error");
      setAboutSaveMsg("Network error");
      setTimeout(() => { setAboutSaveStatus("idle"); setAboutSaveMsg(""); }, 6000);
    }
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
            {(["reorder", "focal", "about"] as AdminView[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-4 py-2 text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{ background: view === v ? "var(--accent)" : "transparent", color: view === v ? "#070707" : "var(--muted)", fontFamily: "var(--font-body)" }}>
                {v === "reorder" ? "Reorder" : v === "focal" ? "Focal Points" : "About Page"}
              </button>
            ))}
          </div>
          {view === "about" && (
            <button onClick={handleSaveAbout} disabled={aboutSaveStatus === "saving"}
              className="px-5 py-2 text-[10px] tracking-widest uppercase rounded-full transition-all duration-200"
              style={{ background: btnColor(aboutSaveStatus).bg, color: btnColor(aboutSaveStatus).color, border: btnColor(aboutSaveStatus).border, fontFamily: "var(--font-body)" }}>
              {aboutSaveStatus === "idle" && "Save About Page"}
              {aboutSaveStatus === "saving" && "Saving..."}
              {aboutSaveStatus === "success" && "✓ Saved"}
              {aboutSaveStatus === "error" && "✗ Failed"}
            </button>
          )}
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
            {/* Swap mode toggle */}
            <button
              onClick={() => setSwapSrc(null)}
              className="text-[9px] tracking-widest uppercase transition-all duration-200"
              style={{
                fontFamily: "var(--font-body)",
                color: swapSrc !== null ? "#070707" : "var(--accent)",
                padding: "5px 14px",
                border: "1px solid var(--accent)",
                borderRadius: "100px",
                background: swapSrc !== null ? "var(--accent)" : "rgba(184,150,106,0.08)",
              }}
            >
              {swapSrc !== null ? `Swap: select 2nd image` : "Click to swap mode"}
            </button>

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
            {/* ── CSS columns — no gaps, matches live site exactly ── */}
            <div style={{ columns: cols, columnGap: "6px" }}>
              {current.map((img, flatIdx) => {
                const isSrc = dragState.src === flatIdx;
                const isOver = dragState.over === flatIdx && dragState.src !== flatIdx;
                return (
                  <div
                    key={img}
                    draggable
                    onDragStart={() => onDragStart(flatIdx)}
                    onDragOver={e => onDragOverItem(e, flatIdx)}
                    onDrop={e => onDropItem(e, flatIdx)}
                    onDragEnd={onDragEnd}
                    onClick={() => handleSwapClick(flatIdx)}
                    onContextMenu={(e) => { e.preventDefault(); setColMenu({ flatIdx, x: e.clientX, y: e.clientY }); }}
                    className="relative group overflow-hidden rounded-lg"
                    style={{
                      breakInside: "avoid",
                      marginBottom: "6px",
                      display: "block",
                      cursor: swapSrc !== null ? "pointer" : "grab",
                      opacity: isSrc ? 0.25 : 1,
                      outline: swapSrc === flatIdx ? "2px solid var(--accent)" : isOver ? "2px solid rgba(184,150,106,0.5)" : "2px solid transparent",
                      outlineOffset: "2px",
                      transition: "opacity 0.15s, outline 0.1s",
                      boxShadow: swapSrc === flatIdx ? "0 0 0 4px rgba(184,150,106,0.15)" : "none",
                    }}
                  >
                    {flatIdx === 0 && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[8px] tracking-widest uppercase"
                        style={{ background: "var(--accent)", color: "#070707", fontFamily: "var(--font-body)" }}>
                        Cover
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
                      style={{ background: "rgba(10,10,10,0.85)", color: isOver ? "var(--accent)" : "#666", fontFamily: "var(--font-body)" }}>
                      {flatIdx + 1}
                    </div>
                    <img src={`/images/${activeTab}/${img}`} alt="" draggable={false}
                      className="w-full h-auto block pointer-events-none select-none" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                      style={{ background: "rgba(10,10,10,0.45)" }}>
                      <p className="text-[10px] tracking-widest" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                        {swapSrc !== null ? (swapSrc === flatIdx ? "✕ deselect" : "⇄ swap here") : "⠿ drag"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ABOUT EDITOR VIEW ── */}
      {view === "about" && (
        <div className="px-5 md:px-10 py-8 pb-20 max-w-3xl">
          {aboutSaveMsg && (
            <div className="mb-6 px-4 py-3 rounded-xl text-xs" style={{
              background: aboutSaveStatus === "error" ? "rgba(239,68,68,0.08)" : "rgba(74,222,128,0.08)",
              border: `1px solid ${aboutSaveStatus === "error" ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.2)"}`,
              color: aboutSaveStatus === "error" ? "#ef4444" : "#4ade80",
              fontFamily: "var(--font-body)"
            }}>{aboutSaveMsg}</div>
          )}

          {/* Bio */}
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-5" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Bio Paragraphs</p>
            <div className="space-y-4">
              {(["bio1", "bio2", "bio3"] as const).map((key, i) => (
                <div key={key}>
                  <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: "#444", fontFamily: "var(--font-body)" }}>Paragraph {i + 1}</p>
                  <textarea
                    value={aboutContent[key]}
                    onChange={e => setAboutContent(prev => ({ ...prev, [key]: e.target.value }))}
                    rows={3}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "#ede8e0", borderRadius: "10px", padding: "12px 14px", fontSize: "0.85rem",
                      fontFamily: "var(--font-body)", resize: "vertical", outline: "none", lineHeight: 1.7,
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-5" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Stats</p>
            <div className="grid grid-cols-2 gap-4">
              {([["stat1num","stat1label"],["stat2num","stat2label"],["stat3num","stat3label"],["stat4num","stat4label"]] as const).map(([numKey, labelKey], i) => (
                <div key={i} className="flex gap-2">
                  <input value={aboutContent[numKey]} onChange={e => setAboutContent(prev => ({ ...prev, [numKey]: e.target.value }))}
                    placeholder="Value" style={{ width: "70px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--accent)", borderRadius: "8px", padding: "10px 12px", fontSize: "1rem", fontFamily: "var(--font-display)", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                  <input value={aboutContent[labelKey]} onChange={e => setAboutContent(prev => ({ ...prev, [labelKey]: e.target.value }))}
                    placeholder="Label" style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#ede8e0", borderRadius: "8px", padding: "10px 12px", fontSize: "0.8rem", fontFamily: "var(--font-body)", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
              ))}
            </div>
          </div>

          {/* Notable shoots */}
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-5" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Notable Shoots</p>
            <div className="space-y-4">
              {([["notable1artist","notable1venue"],["notable2artist","notable2venue"]] as const).map(([artistKey, venueKey], i) => (
                <div key={i} className="flex gap-2">
                  <input value={aboutContent[artistKey]} onChange={e => setAboutContent(prev => ({ ...prev, [artistKey]: e.target.value }))}
                    placeholder="Artist / Event" style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#ede8e0", borderRadius: "8px", padding: "10px 12px", fontSize: "0.85rem", fontFamily: "var(--font-display)", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                  <input value={aboutContent[venueKey]} onChange={e => setAboutContent(prev => ({ ...prev, [venueKey]: e.target.value }))}
                    placeholder="Venue, Location" style={{ flex: 1.5, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#8a8a8a", borderRadius: "8px", padding: "10px 12px", fontSize: "0.8rem", fontFamily: "var(--font-body)", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
              ))}
            </div>
          </div>

          {/* Gear */}
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-5" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Gear</p>
            <div className="space-y-3">
              {([["gear1kind","gear1item"],["gear2kind","gear2item"]] as const).map(([kindKey, itemKey], i) => (
                <div key={i} className="flex gap-2">
                  <input value={aboutContent[kindKey]} onChange={e => setAboutContent(prev => ({ ...prev, [kindKey]: e.target.value }))}
                    placeholder="Body / Lens" style={{ width: "80px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#5a5a5a", borderRadius: "8px", padding: "10px 12px", fontSize: "0.75rem", fontFamily: "var(--font-body)", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                  <input value={aboutContent[itemKey]} onChange={e => setAboutContent(prev => ({ ...prev, [itemKey]: e.target.value }))}
                    placeholder="Gear item name" style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#c8c0b4", borderRadius: "8px", padding: "10px 12px", fontSize: "0.85rem", fontFamily: "var(--font-body)", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px]" style={{ color: "#2a2a2a", fontFamily: "var(--font-body)" }}>
            Note: Save commits changes to GitHub. The about page will update automatically within ~60 seconds.
          </p>
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
      {/* Column move context menu */}
      {colMenu !== null && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            onClick={() => setColMenu(null)}
          />
          {/* Menu */}
          <div
            className="fixed z-50 rounded-xl overflow-hidden"
            style={{
              left: Math.min(colMenu.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 180),
              top: Math.min(colMenu.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 160),
              background: "rgba(18,18,18,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              minWidth: "160px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
          >
            <p
              className="px-4 py-2 text-[9px] tracking-widest uppercase"
              style={{ color: "#444", fontFamily: "var(--font-body)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              Move to column
            </p>
            {Array.from({ length: cols }, (_, i) => {
              const currentCol = colMenu.flatIdx % cols;
              const isCurrentCol = currentCol === i;
              return (
                <button
                  key={i}
                  onClick={() => moveToColumn(colMenu.flatIdx, i)}
                  disabled={isCurrentCol}
                  className="w-full px-4 py-3 text-left text-[11px] transition-colors duration-150"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: isCurrentCol ? "#333" : "#c8c0b4",
                    background: "transparent",
                    cursor: isCurrentCol ? "default" : "pointer",
                    display: "block",
                    borderBottom: i < cols - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                  onMouseEnter={e => { if (!isCurrentCol) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {isCurrentCol ? `✓ Column ${i + 1} (current)` : `Column ${i + 1}`}
                </button>
              );
            })}
          </div>
        </>
      )}

    </main>
  );
}
