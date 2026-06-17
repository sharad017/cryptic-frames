"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let raf: number;
    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;
    let hasMovedOnce = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Snap to position on first move so cursor doesn't slide in from (0,0)
      if (!hasMovedOnce) {
        curX = mouseX;
        curY = mouseY;
        hasMovedOnce = true;
        cursor.classList.add("visible");
      }
    };

    const tick = () => {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.left = curX + "px";
      cursor.style.top = curY + "px";
      raf = requestAnimationFrame(tick);
    };

    const onEnter = () => cursor.classList.add("hovering");
    const onLeave = () => cursor.classList.remove("hovering");

    // Hide cursor when it leaves the window
    const onMouseLeave = () => cursor.classList.remove("visible");
    const onMouseEnter = () => hasMovedOnce && cursor.classList.add("visible");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    raf = requestAnimationFrame(tick);

    // Attach hover listeners — runs once on mount for all current elements
    const addHover = () => {
      document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };
    addHover();

    // Re-attach on DOM changes (e.g. lightbox opening adds new buttons)
    const observer = new MutationObserver(addHover);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return <div id="custom-cursor" ref={cursorRef} />;
}
