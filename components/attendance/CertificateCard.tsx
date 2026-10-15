"use client";
import { useCallback, useState } from "react";
import { Icon, cleanError } from "./ui";
import { releaseDate } from "@/lib/attendance";
import { CertificateCelebration } from "./CertificateCelebration";
type Download = { blob: Blob; filename: string };
function saveCertificate(value: Download) {
  const url = URL.createObjectURL(value.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = value.filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
export function CertificateCard({
  name,
  state,
  demo = false,
  expiresAt,
  releasedAt,
  downloadEndpoint,
}: {
  name: string;
  state: "ineligible" | "scheduled" | "expired" | "available";
  demo?: boolean;
  expiresAt?: number;
  releasedAt?: number;
  downloadEndpoint?: string;
}) {
  const [celebrating, setCelebrating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [download, setDownload] = useState<Download | null>(null);
  const [error, setError] = useState("");
  const deliver = useCallback(() => {
    if (download) saveCertificate(download);
  }, [download]);
  const startDownload = async () => {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(
        downloadEndpoint || `/api/certificate${demo ? "?demo=1" : ""}`,
        {
          cache: "no-store",
        },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Download failed. Please try again.");
      }
      setDownload({
        blob: await response.blob(),
        filename:
          response.headers
            .get("content-disposition")
            ?.match(/filename="([^"]+)"/)?.[1] || "AI-Ocean-Certificate.pdf",
      });
      setCelebrating(true);
    } catch (err) {
      setError(cleanError(err));
    } finally {
      setBusy(false);
    }
  };
  const copy = {
    ineligible:
      "Reach 75% verified attendance to qualify. Every session brings you closer.",
    scheduled:
      "You have reached 75%. Downloads open automatically on November 2, 2026 at 00:00 Myanmar time.",
    expired:
      "The download window has closed. Contact the event team to request assistance.",
    available:
      "You earned this. Your personalized completion certificate is ready — a reminder of everything you learned, built, and accomplished.",
  };
  return (
    <>
      <section className="att-panel att-cert-card">
        <div className="att-panel-heading">
          <div>
            <div
              className="att-eyebrow"
              style={{ color: "var(--accent-yellow)" }}
            >
              Your hard work, recognized
            </div>
            <h2 className="att-panel-title">Your completion certificate</h2>
          </div>
          <Icon name="award" size={30} />
        </div>
        <p className="att-panel-subtitle">
          {demo
            ? `${downloadEndpoint ? "Private" : "Local"} demo: experience your achievement celebration and download a sample certificate with your name.`
            : copy[state]}
        </p>
        <div className="att-cert-actions">
          <button
            className="att-button light"
            onClick={startDownload}
            disabled={
              busy || state === "ineligible" || (!demo && state !== "available")
            }
          >
            <Icon name="download" size={16} />
            {busy
              ? "Preparing your certificate…"
              : demo
                ? "Try demo download"
                : "Download certificate"}
          </button>
        </div>
        <div className="att-meta">
          <span>Personalized certificate</span>
          <span>75% minimum attendance</span>
        </div>
        {!demo && (
          <div className="att-meta">
            <span>
              {releasedAt
                ? `Automatic release: ${releaseDate(releasedAt, true)} MMT`
                : "Automatic release: 2 Nov 2026 · Myanmar time"}
            </span>
            {expiresAt && (
              <span>Download before {releaseDate(expiresAt, true)} MMT</span>
            )}
          </div>
        )}
        {error && (
          <p
            className="att-notice error"
            role="alert"
            style={{ margin: "16px 0 0" }}
          >
            {error}
          </p>
        )}
      </section>
      {celebrating && download && (
        <CertificateCelebration
          name={name}
          demo={demo}
          onDownload={deliver}
          onClose={() => setCelebrating(false)}
        />
      )}
    </>
  );
}
