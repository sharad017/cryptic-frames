"use client";
import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.message.trim()) e.message = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStatus("sending");

    try {
      // Formspree — free, no account needed for setup, just replace YOUR_FORM_ID
      // Get ID: go to formspree.io → New Form → name it "cryptic.frames" → copy the ID from the endpoint URL
      // e.g. https://formspree.io/f/xpwzgkdo → ID is xpwzgkdo
      const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject || `Portfolio inquiry from ${form.name}`,
          message: form.message,
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const inputStyle = (key?: keyof typeof form): React.CSSProperties => ({
    background: "rgba(255,255,255,0.025)",
    border: `1px solid ${key && errors[key] ? "#ef4444" : "rgba(255,255,255,0.07)"}`,
    borderRadius: "10px",
    padding: "14px 18px",
    width: "100%",
    fontSize: "0.875rem",
    color: "var(--fg)",
    fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color 0.2s",
  });

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, key?: keyof typeof form) =>
    (e.target.style.borderColor = key && errors[key] ? "#ef4444" : "var(--accent)");
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, key?: keyof typeof form) =>
    (e.target.style.borderColor = key && errors[key] ? "#ef4444" : "rgba(255,255,255,0.07)");

  if (status === "sent") return (
    <div className="py-14 flex flex-col items-start gap-4">
      <div className="w-11 h-11 rounded-full flex items-center justify-center mb-1"
        style={{ border: "1px solid var(--accent)" }}>
        <span style={{ color: "var(--accent)", fontSize: "1rem" }}>✓</span>
      </div>
      <h3 className="font-light" style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>
        Message received.
      </h3>
      <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
        I'll get back to you within 24–48 hours.
      </p>
      <button onClick={() => setStatus("idle")}
        className="text-[10px] tracking-[0.3em] uppercase mt-2 transition-colors hover:text-white"
        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
        Send another →
      </button>
    </div>
  );

  return (
    <div className="reveal reveal-delay-2 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <input placeholder="Your name" value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
            style={inputStyle("name")}
            onFocus={(e) => onFocus(e, "name")} onBlur={(e) => onBlur(e, "name")} />
          {errors.name && <p className="mt-1 text-[9px] tracking-widest uppercase" style={{ color: "#ef4444", fontFamily: "var(--font-body)" }}>{errors.name}</p>}
        </div>
        <div>
          <input placeholder="Your email" type="email" value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: undefined }); }}
            style={inputStyle("email")}
            onFocus={(e) => onFocus(e, "email")} onBlur={(e) => onBlur(e, "email")} />
          {errors.email && <p className="mt-1 text-[9px] tracking-widest uppercase" style={{ color: "#ef4444", fontFamily: "var(--font-body)" }}>{errors.email}</p>}
        </div>
      </div>

      <input placeholder="Subject — e.g. Concert shoot, Portrait session"
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
        style={inputStyle()}
        onFocus={(e) => onFocus(e)} onBlur={(e) => onBlur(e)} />

      <div>
        <textarea placeholder="Tell me about your project, event, or idea..."
          rows={5} value={form.message}
          onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: undefined }); }}
          style={{ ...inputStyle("message"), resize: "none" }}
          onFocus={(e) => onFocus(e, "message")} onBlur={(e) => onBlur(e, "message")} />
        {errors.message && <p className="mt-1 text-[9px] tracking-widest uppercase" style={{ color: "#ef4444", fontFamily: "var(--font-body)" }}>{errors.message}</p>}
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-6">
        <button onClick={handleSubmit} disabled={status === "sending"}
          className="px-8 py-3 text-[10px] tracking-[0.3em] uppercase rounded-full transition-all duration-300"
          style={{
            background: status === "error" ? "transparent" : "var(--accent)",
            color: status === "error" ? "#ef4444" : "#060606",
            border: status === "error" ? "1px solid #ef4444" : "none",
            fontFamily: "var(--font-body)",
            opacity: status === "sending" ? 0.6 : 1,
            cursor: status === "sending" ? "not-allowed" : "none",
          }}>
          {status === "idle" && "Send message →"}
          {status === "sending" && "Sending..."}
          {status === "error" && "Something went wrong — try again"}
        </button>

        <a href="mailto:sharadrajput7042568316@gmail.com"
          className="text-[10px] tracking-widest uppercase underline underline-offset-4 transition-colors hover:text-white"
          style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          Email directly
        </a>
      </div>

      {/* Setup note — nearly invisible, for you only */}
      <p className="text-[9px] leading-loose pt-1" style={{ color: "#1a1a1a", fontFamily: "var(--font-body)" }}>
        Setup: formspree.io → New Form → copy ID → replace YOUR_FORM_ID in ContactForm.tsx
      </p>
    </div>
  );
}
