"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street", "product"];
const PASSWORD = "Hamilton2005!@#";

type ImageMap = Record<string, string[]>;
type FocalPoint = { desktop: string; mobile: string };
type FocalMap = Record<string, FocalPoint>;
type AdminView = "reorder" | "focal" | "about" | "testimonials";
type SaveStatus = "idle" | "saving" | "success" | "error";
type Testimonial = { id: string; name: string; context: string; quote: string; published: boolean };

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

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsSaveStatus, setTestimonialsSaveStatus] = useState<SaveStatus>("idle");
  const [testimonialsSaveMsg, setTestimonialsSaveMsg] = useState("");
  const [newTestimonial, setNewTestimonial] = useState({ name: "", context: "", quote: "" });
  const setZoom = (key: string, mode: "mobile" | "desktop", val: number) =>
    setFocalZoom(prev => ({ ...prev, [`${key}__${mode}`]: val }));

  // Drag state


  // Column count toggle — 2 / 3 / 4
  const [cols, setCols] = useState(3);

  // Swap mode — click first image, click second to swap
  const [swapSrc, setSwapSrc] = useState<{ col: number; idx: number } | null>(null);

  // Column move menu — right-click an image to move it to a specific column
  const [colMenu, setColMenu] = useState<{ flatIdx: number; x: number; y: number } | null>(null);

  // Independent column lists — each column is its own sequence
  const [colLists, setColLists] = useState<string[][]>([[], [], []]);
  const dragInfo = useRef<{ fromCol: number; fromIdx: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ col: number; idx: number } | null>(null);

  // Split flat Z-order list into per-column lists
  // flat[0]→col0, flat[1]→col1, flat[2]→col2, flat[3]→col0, flat[4]→col1...
  const syncColLists = (flatList: string[], numCols: number) => {
    const columns: string[][] = Array.from({ length: numCols }, () => []);
    flatList.forEach((img, i) => columns[i % numCols].push(img));
    setColLists(columns);
  };

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

  const loadTestimonials = useCallback(async () => {
    try {
      const res = await fetch("/images/testimonials.json?t=" + Date.now());
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  useEffect(() => {
    const s = sessionStorage.getItem("cf_admin");
    if (s === PASSWORD) { setAuthed(true); loadImages(); loadFocal(); loadAboutContent(); loadTestimonials(); }
  }, [loadImages, loadFocal, loadAboutContent, loadTestimonials]);

  // Sync colLists whenever active category, images, or col count changes
  useEffect(() => {
    const flat = images[activeTab] || [];
    syncColLists(flat, cols);
  }, [images, activeTab, cols]); // eslint-disable-line

  const login = () => {
    if (pw === PASSWORD) {
      sessionStorage.setItem("cf_admin", pw);
      setAuthed(true); loadImages(); loadFocal(); loadAboutContent(); loadTestimonials();
    } else { setPwError(true); setTimeout(() => setPwError(false), 2000); }
  };



  // ── Per-column drag handlers ──
  const onItemDragStart = (colIdx: number, itemIdx: number) => {
    dragInfo.current = { fromCol: colIdx, fromIdx: itemIdx };
    setDragOver(null);
  };

  const onItemDragOver = (e: React.DragEvent, colIdx: number, itemIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOver({ col: colIdx, idx: itemIdx });
  };

  const onColDragOver = (e: React.DragEvent, colIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(prev => prev?.col === colIdx ? prev : { col: colIdx, idx: -1 });
  };

  const onColDrop = (e: React.DragEvent, toCol: number, toIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const from = dragInfo.current;
    if (!from) return;

    const newCols = colLists.map(c => [...c]);
    const [item] = newCols[from.fromCol].splice(from.fromIdx, 1);

    if (toIdx === -1 || toIdx >= newCols[toCol].length) {
      newCols[toCol].push(item);
    } else if (from.fromCol === toCol) {
      const adj = from.fromIdx < toIdx ? toIdx - 1 : toIdx;
      newCols[toCol].splice(adj, 0, item);
    } else {
      newCols[toCol].splice(toIdx, 0, item);
    }

    setColLists(newCols);

    // Merge back to flat Z-order: row by row across columns
    const maxLen = Math.max(...newCols.map(c => c.length));
    const flat: string[] = [];
    for (let row = 0; row < maxLen; row++) {
      for (let col = 0; col < cols; col++) {
        if (newCols[col][row]) flat.push(newCols[col][row]);
      }
    }
    setImages(prev => ({ ...prev, [activeTab]: flat }));
    dragInfo.current = null;
    setDragOver(null);
  };

  const onColDragEnd = () => {
    dragInfo.current = null;
    setDragOver(null);
  };

  // ── Swap handler ──
  const handleSwapClick = (col: number, idx: number) => {
    if (!swapSrc) {
      setSwapSrc({ col, idx });
      return;
    }

    if (swapSrc.col === col && swapSrc.idx === idx) {
      setSwapSrc(null);
      return;
    }

    const newCols = colLists.map(c => [...c]);

    [newCols[swapSrc.col][swapSrc.idx], newCols[col][idx]] =
      [newCols[col][idx], newCols[swapSrc.col][swapSrc.idx]];

    setColLists(newCols);

    const maxLen = Math.max(...newCols.map(c => c.length));
    const flat: string[] = [];
    for (let row = 0; row < maxLen; row++) {
      for (let c = 0; c < cols; c++) {
        if (newCols[c][row]) flat.push(newCols[c][row]);
      }
    }

    setImages(prev => ({ ...prev, [activeTab]: flat }));
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

  // ── Testimonials ──
  const handleSaveTestimonials = async (list: Testimonial[]) => {
    setTestimonialsSaveStatus("saving");
    setTestimonialsSaveMsg("Saving testimonials...");
    try {
      const res = await fetch("/api/github-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "testimonials", data: list }),
      });
      const result = await res.json();
      if (result.success) {
        setTestimonialsSaveStatus("success");
        setTestimonialsSaveMsg("✓ Saved — site will update in ~60 seconds");
        setTimeout(() => { setTestimonialsSaveStatus("idle"); setTestimonialsSaveMsg(""); }, 10000);
      } else {
        setTestimonialsSaveStatus("error");
        setTestimonialsSaveMsg("Error: " + (result.error || "Unknown"));
        setTimeout(() => { setTestimonialsSaveStatus("idle"); setTestimonialsSaveMsg(""); }, 6000);
      }
    } catch {
      setTestimonialsSaveStatus("error");
      setTestimonialsSaveMsg("Network error");
      setTimeout(() => { setTestimonialsSaveStatus("idle"); setTestimonialsSaveMsg(""); }, 6000);
    }
  };

  const addTestimonial = () => {
    if (!newTestimonial.name.trim() || !newTestimonial.quote.trim()) return;
    const t: Testimonial = {
      id: (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : String(Date.now()),
      name: newTestimonial.name.trim(),
      context: newTestimonial.context.trim(),
      quote: newTestimonial.quote.trim(),
      published: false,
    };
    setTestimonials(prev => [...prev, t]);
    setNewTestimonial({ name: "", context: "", quote: "" });
  };

  const updateTestimonial = (id: string, patch: Partial<Testimonial>) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const moveTestimonial = (id: string, dir: -1 | 1) => {
    setTestimonials(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const swapIdx = idx + dir;
      if (idx < 0 || swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
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
          <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Admin</p>
          <h1 className="text-xl font-light" style={{ fontFamily: "var(--font-display)" }}>cryptic.frames</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["reorder", "focal", "about", "testimonials"] as AdminView[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-4 py-2 text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{ background: view === v ? "var(--accent)" : "transparent", color: view === v ? "#070707" : "var(--muted)", fontFamily: "var(--font-body)" }}>
                {v === "reorder" ? "Reorder" : v === "focal" ? "Focal Points" : v === "about" ? "About Page" : "Testimonials"}
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
          {view === "testimonials" && (
            <button onClick={() => handleSaveTestimonials(testimonials)} disabled={testimonialsSaveStatus === "saving"}
              className="px-5 py-2 text-[10px] tracking-widest uppercase rounded-full transition-all duration-200"
              style={{ background: btnColor(testimonialsSaveStatus).bg, color: btnColor(testimonialsSaveStatus).color, border: btnColor(testimonialsSaveStatus).border, fontFamily: "var(--font-body)" }}>
              {testimonialsSaveStatus === "idle" && "Save Testimonials"}
              {testimonialsSaveStatus === "saving" && "Saving..."}
              {testimonialsSaveStatus === "success" && "✓ Saved"}
              {testimonialsSaveStatus === "error" && "✗ Failed"}
            </button>
          )}
          <button onClick={() => { loadImages(); loadFocal(); loadAboutContent(); loadTestimonials(); }} className="text-[10px] tracking-widest text-neutral-500 hover:text-white uppercase transition-colors" style={{ fontFamily: "var(--font-body)" }}>Refresh</button>
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
      {view === "reorder" && (
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
      )}

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
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "6px", alignItems: "start" }}>
              {colLists.slice(0, cols).map((colImgs, colIdx) => (
                <div
                  key={colIdx}
                  onDragOver={e => onColDragOver(e, colIdx)}
                  onDrop={e => onColDrop(e, colIdx, -1)}
                  style={{ display: "flex", flexDirection: "column", gap: "6px", minHeight: "120px" }}
                >
                  <div style={{ padding: "3px 8px", textAlign: "center", borderRadius: "6px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#333",
                      textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                      Col {colIdx + 1} · {colImgs.length}
                    </p>
                  </div>

                  {colImgs.map((img, itemIdx) => {
                    const isDragging = dragInfo.current?.fromCol === colIdx && dragInfo.current?.fromIdx === itemIdx;
                    const isOver = dragOver?.col === colIdx && dragOver?.idx === itemIdx;
                    const isCover = colIdx === 0 && itemIdx === 0;
                    return (
                      <div
                        key={img}
                        draggable
                        onDragStart={() => onItemDragStart(colIdx, itemIdx)}
                        onDragOver={e => onItemDragOver(e, colIdx, itemIdx)}
                        onDrop={e => onColDrop(e, colIdx, itemIdx)}
                        onDragEnd={onColDragEnd}
                        onClick={() => handleSwapClick(colIdx, itemIdx)}
                        onContextMenu={e => { e.preventDefault(); setColMenu({ flatIdx: itemIdx, x: e.clientX, y: e.clientY }); }}
                        className="relative group overflow-hidden rounded-lg"
                        style={{
                          cursor: "grab",
                          opacity: isDragging ? 0.2 : 1,
                          outline: isOver ? "2px solid var(--accent)" : (swapSrc?.col === colIdx && swapSrc?.idx === itemIdx) ? "2px solid var(--accent)" : "2px solid transparent",
                          outlineOffset: "2px",
                          transition: "opacity 0.15s, outline 0.1s",
                          boxShadow: (swapSrc?.col === colIdx && swapSrc?.idx === itemIdx) ? "0 0 0 4px rgba(184,150,106,0.15)" : "none",
                        }}
                      >
                        {isCover && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[8px] tracking-widest uppercase"
                            style={{ background: "var(--accent)", color: "#070707", fontFamily: "var(--font-body)" }}>
                            Cover
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
                          style={{ background: "rgba(10,10,10,0.85)", color: isOver ? "var(--accent)" : "#666", fontFamily: "var(--font-body)" }}>
                          {itemIdx + 1}
                        </div>
                        <img src={`/images/${activeTab}/${img}`} alt="" draggable={false}
                          className="w-full h-auto block pointer-events-none select-none" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                          style={{ background: "rgba(10,10,10,0.45)" }}>
                          <p className="text-[10px] tracking-widest" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>⠿ drag</p>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    onDragOver={e => onColDragOver(e, colIdx)}
                    onDrop={e => onColDrop(e, colIdx, -1)}
                    style={{
                      flex: 1, minHeight: "60px", borderRadius: "8px",
                      border: dragOver?.col === colIdx && dragOver?.idx === -1
                        ? "1px dashed var(--accent)" : "1px dashed rgba(255,255,255,0.06)",
                      background: dragOver?.col === colIdx && dragOver?.idx === -1
                        ? "rgba(184,150,106,0.05)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                  >
                    <p style={{ fontSize: "9px", letterSpacing: "0.3em", color: "rgba(255,255,255,0.07)",
                      textTransform: "uppercase", fontFamily: "var(--font-body)" }}>drop here</p>
                  </div>
                </div>
              ))}
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

      {/* ── TESTIMONIALS VIEW ── */}
      {view === "testimonials" && (
        <div className="px-5 md:px-10 py-8 pb-20 max-w-3xl">
          {testimonialsSaveMsg && (
            <div className="mb-6 px-4 py-3 rounded-xl text-xs" style={{
              background: testimonialsSaveStatus === "error" ? "rgba(239,68,68,0.08)" : "rgba(74,222,128,0.08)",
              border: `1px solid ${testimonialsSaveStatus === "error" ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.2)"}`,
              color: testimonialsSaveStatus === "error" ? "#ef4444" : "#4ade80",
              fontFamily: "var(--font-body)"
            }}>{testimonialsSaveMsg}</div>
          )}

          <p className="text-[10px] tracking-widest uppercase mb-6" style={{ color: "#444", fontFamily: "var(--font-body)" }}>
            Only testimonials marked <span style={{ color: "var(--accent)" }}>Published</span> appear on the site. Everything else stays hidden here until you&apos;re ready.
          </p>

          {/* Add new */}
          <div className="mb-10 p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Add Testimonial</p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input value={newTestimonial.name} onChange={e => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Client name" style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#ede8e0", borderRadius: "8px", padding: "10px 12px", fontSize: "0.85rem", fontFamily: "var(--font-body)", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                <input value={newTestimonial.context} onChange={e => setNewTestimonial(prev => ({ ...prev, context: e.target.value }))}
                  placeholder="Project / context (optional)" style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#8a8a8a", borderRadius: "8px", padding: "10px 12px", fontSize: "0.8rem", fontFamily: "var(--font-body)", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
              </div>
              <textarea value={newTestimonial.quote} onChange={e => setNewTestimonial(prev => ({ ...prev, quote: e.target.value }))}
                placeholder="The testimonial quote itself" rows={3}
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#ede8e0", borderRadius: "10px", padding: "12px 14px", fontSize: "0.85rem", fontFamily: "var(--font-body)", resize: "vertical", outline: "none", lineHeight: 1.7 }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
              <button onClick={addTestimonial} disabled={!newTestimonial.name.trim() || !newTestimonial.quote.trim()}
                className="px-5 py-2.5 text-[10px] tracking-widest uppercase rounded-full transition-all duration-200 disabled:opacity-40"
                style={{ background: "var(--accent)", color: "#070707", fontFamily: "var(--font-body)" }}>
                + Add to list
              </button>
            </div>
          </div>

          {/* Existing list */}
          <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
            All Testimonials ({testimonials.length})
          </p>

          {testimonials.length === 0 && (
            <p className="text-xs text-neutral-600" style={{ fontFamily: "var(--font-body)" }}>None yet — add one above.</p>
          )}

          <div className="space-y-3">
            {testimonials.map((t, i) => (
              <div key={t.id} className="p-4 rounded-xl" style={{
                background: "rgba(255,255,255,0.03)",
                border: t.published ? "1px solid rgba(201,169,110,0.4)" : "1px solid rgba(255,255,255,0.08)",
              }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 flex gap-2">
                    <input value={t.name} onChange={e => updateTestimonial(t.id, { name: e.target.value })}
                      placeholder="Client name" style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#ede8e0", borderRadius: "8px", padding: "9px 12px", fontSize: "0.85rem", fontFamily: "var(--font-body)", outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                    <input value={t.context} onChange={e => updateTestimonial(t.id, { context: e.target.value })}
                      placeholder="Context (optional)" style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#8a8a8a", borderRadius: "8px", padding: "9px 12px", fontSize: "0.8rem", fontFamily: "var(--font-body)", outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => moveTestimonial(t.id, -1)} disabled={i === 0}
                      className="w-7 h-7 rounded-full text-xs disabled:opacity-30 hover:bg-white/5 transition-colors" style={{ color: "#888" }}>↑</button>
                    <button onClick={() => moveTestimonial(t.id, 1)} disabled={i === testimonials.length - 1}
                      className="w-7 h-7 rounded-full text-xs disabled:opacity-30 hover:bg-white/5 transition-colors" style={{ color: "#888" }}>↓</button>
                    <button onClick={() => deleteTestimonial(t.id)}
                      className="w-7 h-7 rounded-full text-xs hover:bg-red-500/10 transition-colors" style={{ color: "#a03030" }}>✕</button>
                  </div>
                </div>
                <textarea value={t.quote} onChange={e => updateTestimonial(t.id, { quote: e.target.value })}
                  rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#ede8e0", borderRadius: "8px", padding: "10px 12px", fontSize: "0.85rem", fontFamily: "var(--font-body)", resize: "vertical", outline: "none", lineHeight: 1.6, marginBottom: "10px" }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" checked={t.published} onChange={e => updateTestimonial(t.id, { published: e.target.checked })}
                    className="w-4 h-4 accent-[var(--accent)]" />
                  <span className="text-[10px] tracking-widest uppercase" style={{ color: t.published ? "var(--accent)" : "#666", fontFamily: "var(--font-body)" }}>
                    {t.published ? "Published — live on site" : "Not published"}
                  </span>
                </label>
              </div>
            ))}
          </div>

          <p className="text-[10px] mt-8" style={{ color: "#2a2a2a", fontFamily: "var(--font-body)" }}>
            Note: nothing here goes live until you click Save Testimonials, and only Published entries render on the homepage.
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
    </main>
  );
}
