"use client";
import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const observe = () => {
      const els = document.querySelectorAll(".reveal:not(.visible)");
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              obs.unobserve(e.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -40px 0px", // trigger slightly before element reaches viewport bottom
        }
      );
      els.forEach((el) => obs.observe(el));
      return obs;
    };

    let obs = observe();

    // Re-observe when new elements are added to the DOM
    const mutation = new MutationObserver(() => {
      obs.disconnect();
      obs = observe();
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      obs.disconnect();
      mutation.disconnect();
    };
  }, []);
}
