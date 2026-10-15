"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export function useAttendanceClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function Icon({
  name,
  size = 20,
}: {
  name:
    | "arrow"
    | "download"
    | "upload"
    | "check"
    | "close"
    | "search"
    | "calendar"
    | "clock"
    | "award"
    | "shield"
    | "edit";
  size?: number;
}) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    download: "M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4",
    upload: "M12 16V4m-5 5 5-5 5 5M5 16v4h14v-4",
    check: "m5 12 4 4L19 6",
    close: "m6 6 12 12M6 18 18 6",
    search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    calendar: "M4 5h16v16H4zM4 10h16M8 3v4m8-4v4",
    clock: "M12 8v5l3 2M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0",
    award: "m8 14-2 7 6-3 6 3-2-7M18 8A6 6 0 1 1 6 8a6 6 0 0 1 12 0",
    shield: "m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6zM8 12l3 3 5-6",
    edit: "m15 4 5 5M4 20l5-1L21 7l-5-5L4 14z",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`att-modal ${wide ? "att-modal-wide" : ""}`}
      aria-label={title}
      data-lenis-prevent
    >
      <header>
        <h2>{title}</h2>
        <button
          className="att-icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function ProgressRing({ score }: { score: number }) {
  return (
    <div className="att-ring">
      <svg viewBox="0 0 180 180" aria-label={`${score}% verified attendance`}>
        <circle
          cx="90"
          cy="90"
          r="76"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          opacity=".1"
        />
        <circle
          className="att-ring-value"
          cx="90"
          cy="90"
          r="76"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${score * 4.775} 477.5`}
          transform="rotate(-90 90 90)"
        />
      </svg>
      <div>
        <strong>
          {score}
          <small>%</small>
        </strong>
        <span>verified attendance</span>
      </div>
    </div>
  );
}
export function cleanError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  return message.split("Uncaught Error: ").pop()?.split("\n")[0] || message;
}
