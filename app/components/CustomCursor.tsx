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
      if (!hasMovedOnce) {
        curX = mouseX;
        curY = mouseY;
        hasMovedOnce = true;
        cursor.classList.add("visible");
      }
    };

    const tick = () => {
      // 0.35 = snappy but still smooth. 0.18 was too sluggish.
      curX += (mouseX - curX) * 0.35;
      curY += (mouseY - curY) * 0.35;
      cursor.style.left = curX + "px";
      cursor.style.top = curY + "px";
      raf = requestAnimationFrame(tick);
    };

    const onEnter = () => cursor.classList.add("hovering");
    const onLeave = () => cursor.classList.remove("hovering");
    const onMouseLeave = () => cursor.classList.remove("visible");
    const onMouseEnter = () => hasMovedOnce && cursor.classList.add("visible");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    raf = requestAnimationFrame(tick);

    const addHover = () => {
      document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };
    addHover();

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
