"use client";

import { useState, FormEvent } from "react";

// Replace with your actual Formspree endpoint (same one used on the contact form,
// or create a second Formspree form so submissions land in a separate inbox)
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvkpoyvp";

export default function FeedbackForm() {
  const [wantsToShare, setWantsToShare] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
        setWantsToShare(false);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-serif text-2xl text-neutral-100">
          Received — thank you.
        </p>
        <p className="mt-3 text-sm text-neutral-400">
          Every note helps shape what comes next.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <header className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80">
          After the shoot
        </p>
        <h1 className="mt-3 font-serif text-3xl text-neutral-100 md:text-4xl">
          How was it, working with us?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
          Two minutes, whenever you have them. What you write below stays
          between us — sharing it publicly is a separate, entirely optional
          choice further down.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-14">
        {/* ---------- PRIVATE FEEDBACK ---------- */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-800" />
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Just for us
            </span>
            <span className="h-px flex-1 bg-neutral-800" />
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm text-neutral-300"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition-colors focus:border-amber-500/60"
              />
            </div>

            <div>
              <label
                htmlFor="project"
                className="mb-1.5 block text-sm text-neutral-300"
              >
                Shoot / project
              </label>
              <input
                id="project"
                name="project"
                type="text"
                placeholder="e.g. Confluenz winter concert, portrait session..."
                className="w-full border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition-colors focus:border-amber-500/60 placeholder:text-neutral-600"
              />
            </div>

            <div>
              <label
                htmlFor="privateFeedback"
                className="mb-1.5 block text-sm text-neutral-300"
              >
                What worked, what didn't, anything we could do better
              </label>
              <textarea
                id="privateFeedback"
                name="privateFeedback"
                rows={4}
                required
                placeholder="Communication, delivery time, direction on the day, final gallery — anything at all."
                className="w-full resize-none border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition-colors focus:border-amber-500/60 placeholder:text-neutral-600"
              />
            </div>
          </div>
        </section>

        {/* ---------- OPTIONAL PUBLIC TESTIMONIAL ---------- */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-800" />
            <span className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
              Optional — goes on the site
            </span>
            <span className="h-px flex-1 bg-neutral-800" />
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-neutral-800 bg-neutral-950 px-4 py-4">
            <input
              type="checkbox"
              name="consentToDisplay"
              checked={wantsToShare}
              onChange={(e) => setWantsToShare(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
            />
            <span className="text-sm text-neutral-300">
              I'd like to share a few words that can be featured as a
              testimonial on the website.
            </span>
          </label>

          {wantsToShare && (
            <div className="mt-5">
              <label
                htmlFor="testimonial"
                className="mb-1.5 block text-sm text-neutral-300"
              >
                What stood out about the shoot or the final gallery?
              </label>
              <textarea
                id="testimonial"
                name="testimonial"
                rows={3}
                placeholder="A sentence or two is plenty."
                className="w-full resize-none border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition-colors focus:border-amber-500/60 placeholder:text-neutral-600"
              />
              <p className="mt-2 text-xs text-neutral-500">
                We'll only publish this after checking back with you — nothing
                goes up without your final okay.
              </p>
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full border border-amber-500/60 bg-transparent py-3.5 text-sm uppercase tracking-[0.15em] text-amber-400 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Send feedback"}
        </button>

        {status === "error" && (
          <p className="text-center text-sm text-red-400">
            Something went wrong — mind trying again in a moment?
          </p>
        )}
      </form>
    </div>
  );
}
