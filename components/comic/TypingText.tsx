"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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
  /** ms per character */
  speed?: number;
  className?: string;
}

// Reveals text one character at a time once the surrounding box becomes
// visible (ancestor opacity > 0). An invisible full-text sizer sits in the
// same grid cell so the box keeps its final size while typing.
export default function TypingText({
  children,
  speed = 16,
  className,
}: TypingTextProps) {
  const text = flattenText(children);
  const [count, setCount] = useState(0);
  const rootRef = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    startedRef.current = false;

    const boxVisible = () => {
      const el = rootRef.current;
      if (!el) return false;
      let opacity = 1;
      let node: HTMLElement | null = el;
      while (node) {
        opacity *= parseFloat(getComputedStyle(node).opacity || "1");
        if (opacity <= 0.05) return false;
        node = node.parentElement;
      }
      return true;
    };

    let typer: ReturnType<typeof setInterval> | null = null;
    const poll = setInterval(() => {
      if (startedRef.current || !boxVisible()) return;
      startedRef.current = true;
      clearInterval(poll);
      let i = 0;
      typer = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length && typer) clearInterval(typer);
      }, speed);
    }, 150);

    return () => {
      clearInterval(poll);
      if (typer) clearInterval(typer);
    };
  }, [text, speed]);

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
