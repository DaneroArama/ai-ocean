"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Icon } from "./ui";

export function CertificateCelebration({
  name,
  demo,
  onDownload,
  onClose,
}: {
  name: string;
  demo: boolean;
  onDownload: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const delivered = useRef(false);
  const timers = useRef<number[]>([]);
  const [stage, setStage] = useState(0);
  const finish = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    if (!delivered.current) {
      delivered.current = true;
      onDownload();
    }
    setStage(3);
  }, [onDownload]);
  const close = () => {
    finish();
    onClose();
  };
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.current = [window.setTimeout(finish, 0)];
    } else {
      timers.current = [
        window.setTimeout(() => setStage(1), 1200),
        window.setTimeout(() => setStage(2), 3500),
        window.setTimeout(finish, 8500),
      ];
    }
    return () => {
      timers.current.forEach(window.clearTimeout);
      dialog?.close();
    };
  }, [finish]);
  return (
    <dialog
      ref={ref}
      className="att-achievement"
      aria-label="Your buildathon achievement"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      data-lenis-prevent
    >
      <button
        className="att-achievement-close"
        aria-label="Close celebration"
        onClick={close}
      >
        <Icon name="close" />
      </button>
      <div className={`att-achievement-scene att-stage-${stage}`}>
        <div className="att-achievement-glow" aria-hidden="true" />
        <div className="att-achievement-rays" aria-hidden="true" />
        <div className="att-achievement-confetti" aria-hidden="true">
          {Array.from({ length: 64 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${(i * 37) % 100}%`,
                background: [
                  "var(--accent-yellow)",
                  "var(--ocean-pale)",
                  "var(--accent-purple)",
                  "var(--accent-coral)",
                  "white",
                ][i % 5],
                animationDelay: `${(i % 12) * 0.24}s`,
                animationDuration: `${5 + (i % 4)}s`,
              }}
            />
          ))}
        </div>
        <div className="att-achievement-intro">
          <span className="att-achievement-kicker">
            INTO THE AI OCEAN · 2026
          </span>
          <p>
            {stage < 2
              ? "Some journeys change what you can do."
              : "This one is yours to be proud of."}
          </p>
        </div>
        <div className="att-achievement-medal" aria-hidden="true">
          <div className="att-medal-orbit" />
          <div className="att-medal-ribbon" />
          <div className="att-medal-face">
            <Icon name="award" size={74} />
            <span>BUILDATHON</span>
            <strong>COMPLETED</strong>
          </div>
        </div>
        <div className="att-achievement-copy" aria-live="polite">
          <div className="att-achievement-kicker">
            {stage < 2
              ? "You showed up. You learned. You built."
              : "A big achievement. An even bigger future."}
          </div>
          <h2>
            {stage < 2 ? (
              "Look how far you’ve come."
            ) : (
              <>
                You did it,
                <br />
                <span>{name}.</span>
              </>
            )}
          </h2>
          <p>
            {stage < 2
              ? "Every challenge, every idea, every day you kept going — it brought you here."
              : "You turned curiosity into something real. You built alongside your team, pushed through the challenges, and completed the AI Ocean Buildathon."}
          </p>
        </div>
        <div className="att-achievement-crew" aria-hidden="true">
          {["Tuto", "Shark", "Octo", "Crabi", "Ali"].map((character, i) => (
            <Image
              key={character}
              src={`/assets/Mascots/${character}.png`}
              alt=""
              width={230}
              height={230}
              loading="eager"
              style={{ animationDelay: `${i * 0.17}s` }}
            />
          ))}
        </div>
        <div className="att-achievement-finale">
          <span className="att-achievement-kicker">
            The whole ocean is celebrating you
          </span>
          {stage === 3 ? (
            <>
              <p className="att-achievement-saved" role="status">
                <Icon name="check" size={17} />
                {demo
                  ? "Your demo certificate download has started"
                  : "Your certificate download has started"}
              </p>
              <div className="att-achievement-actions">
                <button className="att-button light" onClick={onDownload}>
                  <Icon name="download" size={17} />
                  Save certificate again
                </button>
                <button className="att-button ghost" onClick={close}>
                  Back to my journey
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="att-achievement-countdown" aria-hidden="true">
                <span />
              </div>
              <button className="att-achievement-skip" onClick={finish}>
                Skip to my certificate <Icon name="arrow" size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
