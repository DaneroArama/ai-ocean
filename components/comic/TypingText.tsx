"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getLenis } from "@/lib/comic/lenisClient";

function flattenText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(flattenText).join("");
  }
  if (typeof node === "object" && "props" in node) {
    return flattenText(
      (node as { props?: { children?: ReactNode } }).props?.children
    );
  }
  return "";
}

interface TypingTextProps {
  children: ReactNode;
  /** px of scroll needed to reveal one character */
  pxPerChar?: number;
  className?: string;
}

// Reading lock: once a box is fully visible, scroll input is captured and
// converted into character reveals until the text is complete — the scene
// underneath stays frozen. Scrolling up un-types; once the text is back at
// its start, further scroll-up releases the lock and moves the page again.
// During the fade-in/out zones the reveal still follows raw scroll delta.
// An invisible full-text sizer sits in the same grid cell so the box keeps
// its final size while typing.

type ActiveTyper = {
  feed: (dy: number) => void;
  done: () => boolean;
  atStart: () => boolean;
};

let activeTyper: ActiveTyper | null = null;
let locked = false;
let handlersInstalled = false;

const KEY_SCROLL_AMOUNT = 120;

function engage(typer: ActiveTyper) {
  if (locked) return;
  locked = true;
  activeTyper = typer;
  getLenis()?.stop();
}

function release() {
  if (!locked) return;
  locked = false;
  activeTyper = null;
  getLenis()?.start();
}

function installHandlers() {
  if (handlersInstalled || typeof window === "undefined") return;
  handlersInstalled = true;

  const consume = (dy: number, e: Event) => {
    const typer = activeTyper;
    if (!typer) return;
    e.preventDefault();
    e.stopPropagation();
    typer.feed(dy);
    if (typer.done() || (dy < 0 && typer.atStart())) release();
  };

  window.addEventListener(
    "wheel",
    (e) => {
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;
      consume(dy, e);
    },
    { capture: true, passive: false }
  );

  let lastTouchY: number | null = null;
  window.addEventListener(
    "touchstart",
    (e) => {
      lastTouchY = e.touches[0]?.clientY ?? null;
    },
    { capture: true, passive: true }
  );
  window.addEventListener(
    "touchmove",
    (e) => {
      const y = e.touches[0]?.clientY ?? null;
      if (y === null || lastTouchY === null) {
        lastTouchY = y;
        return;
      }
      const dy = lastTouchY - y;
      lastTouchY = y;
      consume(dy, e);
    },
    { capture: true, passive: false }
  );
  window.addEventListener(
    "touchend",
    () => {
      lastTouchY = null;
    },
    { capture: true, passive: true }
  );

  window.addEventListener("keydown", (e) => {
    let dy = 0;
    if (e.key === "PageDown" || e.key === "ArrowDown" || e.key === " ") {
      dy = KEY_SCROLL_AMOUNT;
    } else if (e.key === "PageUp" || e.key === "ArrowUp") {
      dy = -KEY_SCROLL_AMOUNT;
    } else {
      return;
    }
    consume(dy, e);
  }, { capture: true });
}

export default function TypingText({
  children,
  pxPerChar = 3,
  className,
}: TypingTextProps) {
  const text = flattenText(children);
  const [count, setCount] = useState(0);
  const rootRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef(0);
  const accRef = useRef(0);
  const lastYRef = useRef<number | null>(null);

  useEffect(() => {
    countRef.current = 0;
    accRef.current = 0;
    lastYRef.current = null;
    setCount(0);
    installHandlers();

    const boxOpacity = () => {
      const el = rootRef.current;
      if (!el) return 0;
      let opacity = 1;
      let node: HTMLElement | null = el;
      while (node) {
        opacity *= parseFloat(getComputedStyle(node).opacity || "1");
        node = node.parentElement;
      }
      return opacity;
    };

    const apply = (next: number) => {
      const clamped = Math.max(0, Math.min(text.length, next));
      if (clamped !== countRef.current) {
        countRef.current = clamped;
        setCount(clamped);
      }
    };

    const typer: ActiveTyper = {
      feed: (dy) => {
        accRef.current += dy;
        const delta = Math.trunc(accRef.current / pxPerChar);
        if (delta !== 0) {
          accRef.current -= delta * pxPerChar;
          apply(countRef.current + delta);
        }
      },
      done: () => countRef.current >= text.length,
      atStart: () => countRef.current <= 0,
    };

    const releaseIfEngaged = () => {
      if (activeTyper === typer) release();
    };

    const onScroll = () => {
      const y = window.scrollY;
      const last = lastYRef.current;
      lastYRef.current = y;
      if (last === null) return;
      const dy = y - last;

      const opacity = boxOpacity();

      if (opacity < 0.05) {
        releaseIfEngaged();
        accRef.current = 0;
        apply(0);
        return;
      }

      // Only lock on a downward pass — scrolling up must never re-engage,
      // otherwise stop/start loops while un-typing
      if (opacity >= 0.95 && !typer.done() && dy > 0) {
        engage(typer);
        return;
      }

      if (activeTyper === typer && typer.done()) release();

      // Fade zones: reveal straight from the real scroll delta
      if (activeTyper !== typer) {
        accRef.current += dy;
        const delta = Math.trunc(accRef.current / pxPerChar);
        if (delta !== 0) {
          accRef.current -= delta * pxPerChar;
          apply(countRef.current + delta);
        }
      }
    };

    lastYRef.current = window.scrollY;
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      releaseIfEngaged();
    };
  }, [text, pxPerChar]);

  const shown = text.slice(0, count);

  return (
    <span ref={rootRef} className={className} style={{ display: "grid" }}>
      <span
        style={{ gridArea: "1 / 1", visibility: "hidden" }}
        aria-hidden="true"
      >
        {text}
      </span>
      <span style={{ gridArea: "1 / 1" }}>{shown}</span>
    </span>
  );
}
