"use client";

import buildingPost from "@/app/assets/frames/Ai Frame I’m building.png";
import competingPost from "@/app/assets/frames/Ai Frame I’m competing.png";
import surfingPost from "@/app/assets/frames/Ai Frame I’m surfing.png";
import buildingStory from "@/app/assets/frames/myday Ai Frame I’m building.png";
import competingStory from "@/app/assets/frames/myday Ai Frame I’m Competing.png";
import surfingStory from "@/app/assets/frames/myday Ai Frame I’m surfing.png";
import NextImage, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { useEffect, useRef, useState } from "react";

type FormatId = "post" | "story";
type VariantId = "building" | "competing" | "surfing";

interface FrameFormat {
  id: FormatId;
  label: string;
  badge: string;
  use: string;
  width: number;
  height: number;
  outWidth: number;
  outHeight: number;
  opening: { x: number; y: number; width: number; height: number };
}

/** Photo opening measured against the supplied frame artwork (both sizes share
 * the same opening box, only the canvas and the vertical offset differ). */
const FRAME_FORMATS: Record<FormatId, FrameFormat> = {
  post: {
    id: "post",
    label: "Post",
    badge: "4:5",
    use: "Feed post · works everywhere",
    width: 2400,
    height: 3000,
    outWidth: 1080,
    outHeight: 1350,
    opening: { x: 138, y: 150, width: 2122, height: 1780 },
  },
  story: {
    id: "story",
    label: "MyDay Story",
    badge: "9:16",
    use: "Stories · MyDay · full screen",
    width: 2400,
    height: 4250,
    outWidth: 1080,
    outHeight: 1913,
    opening: { x: 138, y: 450, width: 2122, height: 1780 },
  },
};

const FORMAT_ORDER: FormatId[] = ["post", "story"];

const FRAME_VARIANTS: { id: VariantId; label: string }[] = [
  { id: "building", label: "I’m building" },
  { id: "competing", label: "I’m competing" },
  { id: "surfing", label: "I’m surfing" },
];

const FRAME_IMAGES: Record<FormatId, Record<VariantId, StaticImageData>> = {
  post: { building: buildingPost, competing: competingPost, surfing: surfingPost },
  story: { building: buildingStory, competing: competingStory, surfing: surfingStory },
};

const MASCOTS = [
  { id: "ali", name: "Ali", src: "/assets/Mascots/Ali.png" },
  { id: "crabi", name: "Crabi", src: "/assets/Mascots/Crabi.png" },
  { id: "octo", name: "Octo", src: "/assets/Mascots/Octo.png" },
  { id: "shark", name: "Shark", src: "/assets/Mascots/Shark.png" },
  { id: "tuto", name: "Tuto", src: "/assets/Mascots/Tuto.png" },
];

const AI_PROMPT = `Create ONE finished premium anime/game character illustration of the person in Image 1, inspired by the character and archetype in Image 2.

STYLE: Premium modern Japanese/Korean game-style anime — semi-realistic face, clean linework, soft cel shading, polished digital painting, expressive eyes, detailed hair, fashionable clothing, mature/charming design. Preserve the person's identity and key facial features. Keep them human. No chibi, childish, photorealistic, rough sketch, or 3D/Pixar style.

INTEGRATION: Translate Image 2's character into the person's human design using its colors, shapes, clothing, accessories, and props. Keep the mascot influence recognizable, playful, and fashionable. Do not place the mascot beside them or turn the person into an animal.

POSE: One natural hero pose and expression based on Image 2's archetype.

COMPOSITION: ONE participant only, full-body or 3/4-body. Keep the participant dominant and props secondary. Everything must stay inside Image 1's black rectangular area. Image 1 is LOCKED — modify only the black area.

BACKGROUND: Clean ocean-blue environment matching Image 1, with subtle waves, bubbles, painterly textures, gradients, aquatic shapes, and character-specific accents. Keep it clean, not a detailed underwater scene.

ASPECT RATIO: 1.1`;

const AI_TOOLS = [
  { name: "ChatGPT", url: "https://chatgpt.com/" },
  { name: "Google Gemini", url: "https://gemini.google.com/" },
  { name: "Grok", url: "https://grok.com/" },
  { name: "Midjourney", url: "https://www.midjourney.com/" },
  { name: "Leonardo.Ai", url: "https://leonardo.ai/" },
  { name: "Ideogram", url: "https://www.ideogram.ai/" },
];

const STEPS = [
  { title: "Upload", hint: "Upload your image to get started" },
  { title: "Caption", hint: "Pick the caption that fits you" },
  { title: "Adjust", hint: "Move and zoom your photo into place" },
  { title: "Finish", hint: "Choose your format, then download" },
];

/** Frame preview with the empty photo opening replaced by a drop-in indicator. */
function FrameThumb({ format, variant, className = "", boxClassName = "max-h-full max-w-full w-full sm:h-48 sm:w-auto md:h-60 lg:h-80 xl:h-96" }: { format: FormatId; variant: VariantId; className?: string; boxClassName?: string }) {
  const fmt = FRAME_FORMATS[format];
  const opening = {
    left: `${(fmt.opening.x / fmt.width) * 100}%`,
    top: `${(fmt.opening.y / fmt.height) * 100}%`,
    width: `${(fmt.opening.width / fmt.width) * 100}%`,
    height: `${(fmt.opening.height / fmt.height) * 100}%`,
  };
  return (
    <span className={`flex h-full w-full items-center justify-center ${className}`}>
      <span className={`relative block ${boxClassName}`} style={{ aspectRatio: `${fmt.width} / ${fmt.height}` }}>
        <NextImage src={FRAME_IMAGES[format][variant]} alt="" fill sizes="(min-width: 1024px) 320px, (min-width: 640px) 220px, 34vw" className="rounded-xl object-cover shadow-sm" />
        <span
          style={opening}
          className="absolute flex flex-col items-center justify-center gap-0.5 rounded-md border-2 border-dashed border-ocean-primary/70 bg-gradient-to-br from-cyan-100/95 to-sky-50/95 text-ocean-deep"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3 w-3 sm:h-4 sm:w-4">
            <path d="M4 8.5h2.2l1.3-2h9l1.3 2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span className="px-1 text-center text-[6px] font-bold uppercase leading-[1.15] tracking-wide sm:text-[9px]">Your photo here</span>
        </span>
      </span>
    </span>
  );
}

/** Optional, non-blocking instructions: mascots + prompt + AI tools. */
function GuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
    } catch {
      const area = document.createElement("textarea");
      area.value = AI_PROMPT;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); } catch { /* clipboard unavailable */ }
      document.body.removeChild(area);
    }
    setCopied(true);
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain sm:items-center" role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <button type="button" aria-label="Close guide" onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:mx-4 sm:rounded-3xl">
        <header className="flex shrink-0 items-start gap-3 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-3 sm:px-5 sm:py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-cyan-100">✨</span>
          <div className="min-w-0 flex-1">
            <h2 id="guide-title" className="font-bold text-ocean-deep">Generate your image with AI <span className="text-xs font-semibold text-ocean-medium">(optional)</span></h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">Skip this if you already have a picture — the only real step is uploading it.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close guide" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white bg-white/80 text-slate-500 transition hover:text-ocean-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>

          <div data-lenis-prevent className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">1 · Prepare your photo (Image 1)</h3>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-ocean-primary shadow-sm ring-1 ring-cyan-100">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <circle cx="12" cy="8.5" r="3.6" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M5 19.5c1.4-3.2 4-4.8 7-4.8s5.6 1.6 7 4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                Any picture with <span className="font-semibold text-ocean-deep">your face</span> in it — a clear selfie, a portrait or a photo you already love. One person, front-facing, works best. It stays on your device.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">2 · Download a mascot you like (Image 2)</h3>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {MASCOTS.map((mascot) => (
                <a
                  key={mascot.id}
                  href={mascot.src}
                  download={`ai-ocean-mascot-${mascot.id}.png`}
                  className="group flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white p-2 text-center transition hover:-translate-y-0.5 hover:border-ocean-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-b from-cyan-50 to-sky-50 sm:h-20 sm:w-20">
                    <NextImage src={mascot.src} alt={mascot.name} width={80} height={80} className="h-full w-full object-contain transition group-hover:scale-105" />
                  </span>
                  <span className="text-xs font-bold text-ocean-deep">{mascot.name}</span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 transition group-hover:bg-ocean-primary group-hover:text-white">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Save
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">3 · Copy the prompt and generate</h3>
            <div className="mt-4 flex max-h-56 flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-inner sm:max-h-64">
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-slate-800/80 px-3 py-2">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M8 7L4 12l4 5M16 7l4 5-4 5M13.5 5l-3 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  AI prompt
                </span>
                <button type="button" onClick={copyPrompt} className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${copied ? "bg-emerald-500 text-white" : "bg-cyan-500 text-white hover:bg-cyan-400"}`}>
                  {copied ? (
                    <><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>Copied!</>
                  ) : (
                    <><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M15 5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>Copy prompt</>
                  )}
                </button>
              </div>
              <pre data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words px-3 py-2.5 font-mono text-[10.5px] leading-relaxed text-slate-100 sm:px-4 sm:text-xs">{AI_PROMPT}</pre>
            </div>
            <p className="mt-4 text-xs leading-snug text-slate-500 sm:text-sm">
              Open any tool below, upload <span className="font-semibold text-ocean-deep">your photo + the mascot</span>, paste the prompt, generate and save the result.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {AI_TOOLS.map((tool) => (
                <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 rounded-full border border-cyan-200 bg-white px-3 text-xs font-semibold text-ocean-primary shadow-sm transition hover:border-ocean-primary hover:bg-cyan-50">
                  {tool.name}
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M14 5h5v5M19 5l-8 8M18 14v4a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8a1.5 1.5 0 0 1 1.5-1.5H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">4 · Bring it back and add the frame</h3>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm ring-1 ring-emerald-100">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M4 15.5l4.5-4 3.5 3 3.5-3.5L20 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                Upload the picture you just generated on this page, pick a caption, adjust it, choose <span className="font-semibold text-ocean-deep">Post</span> or <span className="font-semibold text-ocean-deep">MyDay Story</span> and download your framed photo — about a minute, no sign-in needed.
              </p>
            </div>
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
          <p className="hidden text-xs text-slate-400 sm:block">Anything you generate stays on your device.</p>
          <button type="button" onClick={onClose} className="ml-auto min-h-10 rounded-xl bg-gradient-to-r from-ocean-deep via-ocean-primary to-ocean-light px-5 text-sm font-bold text-white shadow-md shadow-cyan-500/25 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary">
            Got it — upload my image
          </button>
        </footer>
      </div>
    </div>
  );
}

function FrameGenerator() {
  const { isAuthenticated } = useConvexAuth();
  const [showGuide, setShowGuide] = useState(false);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [format, setFormat] = useState<FormatId>("post");
  const [variant, setVariant] = useState<VariantId | null>(null);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [downloaded, setDownloaded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [adjustmentComplete, setAdjustmentComplete] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportingRef = useRef(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistanceRef = useRef<number | null>(null);
  const frameFormat = FRAME_FORMATS[format];
  const stepStates = [Boolean(photo), Boolean(photo && variant), adjustmentComplete, downloaded];
  const furthestStep = !photo ? 0 : !variant ? 1 : !adjustmentComplete ? 2 : 3;
  const progress = Math.max(stepStates.filter(Boolean).length / STEPS.length, furthestStep / (STEPS.length - 1)) * 100;

  const navigateToStep = (index: number) => {
    if (index > furthestStep) return;
    setCurrentStep(index);
  };

  const nextStep = () => {
    const next = currentStep + 1;
    if (next > STEPS.length - 1) return;
    if (currentStep === 2) setAdjustmentComplete(true);
    else if (next > furthestStep) return;
    setCurrentStep(next);
  };

  const previousStep = () => setCurrentStep((step) => Math.max(0, step - 1));

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) setFrameImage(image);
    };
    image.onerror = () => {
      if (!cancelled) setError("The selected frame could not be loaded.");
    };
    image.src = FRAME_IMAGES[format][variant ?? "building"].src;
    return () => { cancelled = true; };
  }, [format, variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const { outWidth, outHeight, opening } = frameFormat;
    canvas.width = outWidth;
    canvas.height = outHeight;

    const gradient = context.createLinearGradient(0, 0, outWidth, outHeight);
    gradient.addColorStop(0, "#DDF5F4");
    gradient.addColorStop(1, "#A8DDE5");
    context.fillStyle = gradient;
    context.fillRect(0, 0, outWidth, outHeight);

    if (photo) {
      const outputX = (opening.x / frameFormat.width) * outWidth;
      const outputY = (opening.y / frameFormat.height) * outHeight;
      const outputWidth = (opening.width / frameFormat.width) * outWidth;
      const outputHeight = (opening.height / frameFormat.height) * outHeight;
      const scale = Math.max(outputWidth / photo.naturalWidth, outputHeight / photo.naturalHeight) * zoom;
      const imageWidth = photo.naturalWidth * scale;
      const imageHeight = photo.naturalHeight * scale;
      const maxShiftX = Math.max(0, (imageWidth - outputWidth) / 2);
      const maxShiftY = Math.max(0, (imageHeight - outputHeight) / 2);
      const imageX = outputX + (outputWidth - imageWidth) / 2 + position.x * maxShiftX;
      const imageY = outputY + (outputHeight - imageHeight) / 2 + position.y * maxShiftY;
      context.save();
      context.beginPath();
      context.rect(outputX, outputY, outputWidth, outputHeight);
      context.clip();
      context.drawImage(photo, imageX, imageY, imageWidth, imageHeight);
      context.restore();
    } else {
      context.fillStyle = "#0A3D62";
      context.textAlign = "center";
      context.font = "700 42px sans-serif";
      context.fillText("Upload a photo to preview your frame", outWidth / 2, outHeight / 2);
    }
    if (frameImage && variant) context.drawImage(frameImage, 0, 0, outWidth, outHeight);
  }, [photo, frameImage, variant, frameFormat, position, zoom, currentStep]);

  const loadFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file to create your frame.");
      return;
    }
    setError("");
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setPhoto(image);
      setPhotoName(file.name);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setDownloaded(false);
      setAdjustmentComplete(false);
      setCurrentStep((step) => (variant ? step : 1));
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError("That image could not be opened. Try another image.");
    };
    image.src = url;
  };

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    loadFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    loadFile(event.dataTransfer.files?.[0]);
  };

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !photo || !variant) {
      setError(!photo ? "Upload an image to continue." : "Choose a caption to continue.");
      return;
    }
    if (exportingRef.current) return;
    exportingRef.current = true;
    setExporting(true);
    setError("");
    let url = "";
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("PNG export failed");
      url = URL.createObjectURL(blob);
      // Safari/iOS ignores `download` on data: URLs and needs the anchor
      // inside the document, so use a blob URL with an attached <a>.
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-ocean-${format}-${variant}-frame.png`;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloaded(true);
    } catch {
      // Last resort (old iOS): show the image so it can be long-press saved.
      if (url) window.open(url, "_blank");
      setError("Couldn't start the download — press and hold the image, then choose “Save to Photos”.");
    } finally {
      if (url) window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      exportingRef.current = false;
      setExporting(false);
    }
  };

  const handlePreviewPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 1) dragRef.current = { x: event.clientX, y: event.clientY };
    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      pinchDistanceRef.current = Math.hypot(first.x - second.x, first.y - second.y);
      dragRef.current = null;
    }
  };

  const handlePreviewPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !photo || !pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size >= 2) {
      const [first, second] = [...pointersRef.current.values()];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (pinchDistanceRef.current && distance > 0) {
        const ratio = distance / pinchDistanceRef.current;
        setZoom((value) => clampZoom(value * ratio));
        setDownloaded(false);
      }
      pinchDistanceRef.current = distance;
      return;
    }
    const previous = dragRef.current;
    if (!previous) return;
    const rect = canvas.getBoundingClientRect();
    const { opening } = frameFormat;
    const dx = (event.clientX - previous.x) * (canvas.width / rect.width);
    const dy = (event.clientY - previous.y) * (canvas.height / rect.height);
    const outputWidth = (opening.width / frameFormat.width) * canvas.width;
    const outputHeight = (opening.height / frameFormat.height) * canvas.height;
    const scale = Math.max(outputWidth / photo.naturalWidth, outputHeight / photo.naturalHeight) * zoom;
    const maxShiftX = Math.max(0, (photo.naturalWidth * scale - outputWidth) / 2);
    const maxShiftY = Math.max(0, (photo.naturalHeight * scale - outputHeight) / 2);
    setPosition((current) => ({
      x: maxShiftX ? Math.max(-1, Math.min(1, current.x + dx / maxShiftX)) : 0,
      y: maxShiftY ? Math.max(-1, Math.min(1, current.y + dy / maxShiftY)) : 0,
    }));
    setDownloaded(false);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePreviewPointerEnd = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(event.pointerId);
    pinchDistanceRef.current = null;
    const remaining = [...pointersRef.current.values()][0];
    dragRef.current = pointersRef.current.size === 1 && remaining ? remaining : null;
  };

  const handleWheelZoom = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (!photo) return;
    event.preventDefault();
    setZoom((value) => clampZoom(value * Math.exp(-event.deltaY * 0.001)));
    setDownloaded(false);
  };

  const resetAdjustment = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setDownloaded(false);
  };

  const clampZoom = (value: number) => Math.max(1, Math.min(3, value));

  const previewCanvas = (interactive: boolean, label: string) => (
    <canvas
      ref={canvasRef}
      style={{ aspectRatio: `${frameFormat.outWidth} / ${frameFormat.outHeight}` }}
      aria-label={label}
      className={`block h-full max-h-full w-auto max-w-full rounded-2xl bg-cyan-50 shadow-lg ring-1 ring-slate-200/80 ${interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
      onPointerDown={interactive ? handlePreviewPointerDown : undefined}
      onPointerMove={interactive ? handlePreviewPointerMove : undefined}
      onPointerUp={interactive ? handlePreviewPointerEnd : undefined}
      onPointerCancel={interactive ? handlePreviewPointerEnd : undefined}
      onWheel={interactive ? handleWheelZoom : undefined}
    />
  );

  const stepButtonClass = (index: number) =>
    `flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:h-10 sm:w-10 ${
      currentStep === index
        ? stepStates[index]
          ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
          : "bg-ocean-primary text-white ring-4 ring-cyan-100 scale-110"
        : stepStates[index]
          ? "bg-emerald-500 text-white hover:bg-emerald-600"
          : "bg-white text-slate-400 ring-1 ring-slate-200"
    } disabled:cursor-not-allowed`;

  const secondaryButtonClass =
    "min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-5 py-2.5 font-semibold text-ocean-primary shadow-sm transition hover:border-cyan-400 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:w-auto sm:py-3";

  const primaryButtonClass =
    "min-h-11 w-full rounded-xl bg-gradient-to-r from-ocean-deep via-ocean-primary to-ocean-light px-5 py-2.5 font-bold text-white shadow-md shadow-cyan-500/25 transition hover:brightness-110 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto sm:py-3";

  const stepHeader = (index: number, title: string, subtitle: string, action?: React.ReactNode) => (
    <div className="mb-3 flex shrink-0 items-start gap-3 sm:mb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-50 to-sky-100 font-bold text-ocean-primary ring-1 ring-cyan-100">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <h2 id={`step-${index}-title`} className="font-bold text-ocean-deep">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
      </div>
      {action}
    </div>
  );

  return (
    <main className="relative h-screen h-[100dvh] min-h-0 overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50 to-sky-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden px-3 py-2 sm:px-6 sm:py-3">
        <header className="mb-2 shrink-0 sm:mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 text-xs font-semibold text-ocean-primary shadow-sm backdrop-blur transition hover:bg-white hover:text-ocean-deep sm:min-h-9 sm:text-sm">
                <span aria-hidden="true">←</span> AI Ocean
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard" className="hidden min-h-8 items-center rounded-full border border-cyan-100 bg-white/70 px-3 text-xs font-semibold text-ocean-medium backdrop-blur transition hover:border-cyan-300 hover:text-ocean-deep sm:inline-flex sm:min-h-9 sm:text-sm">
                  Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                aria-label="Open the optional AI image guide"
                className="inline-flex min-h-8 items-center gap-1 rounded-full border border-cyan-100 bg-white/80 px-2.5 text-xs font-semibold text-ocean-medium shadow-sm backdrop-blur transition hover:border-cyan-300 hover:text-ocean-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:min-h-9 sm:px-3 sm:text-sm"
              >
                <span aria-hidden="true">✨</span><span className="hidden sm:inline">How to Create Character Image</span>
              </button>
            </div>
          </div>
          <div className="mt-1.5 flex items-end justify-between gap-3 sm:mt-4">
            <div className="min-w-0">
              <h1 className="font-syncopate text-base font-bold leading-tight text-ocean-deep sm:text-xl">
                Create your <span className="bg-gradient-to-r from-ocean-primary via-sky-500 to-cyan-400 bg-clip-text text-transparent">event frame</span>
              </h1>
              <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">Upload a picture, caption it, adjust it and download — everything stays in your browser.</p>
            </div>
          </div>
        </header>

        <section aria-label="Frame creation progress" className="mx-auto mb-2 w-full max-w-5xl shrink-0 rounded-2xl border border-white/70 bg-white/90 p-2.5 shadow-lg shadow-sky-500/5 backdrop-blur sm:mb-3 sm:p-4">
          <ol aria-label="Step navigation" className="grid grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex justify-center">
                <button type="button" onClick={() => navigateToStep(index)} disabled={index > furthestStep} aria-current={currentStep === index ? "step" : undefined} aria-label={`${stepStates[index] ? "Completed step" : currentStep === index ? "Current step" : "Step"} ${index + 1}: ${step.title}`} className={stepButtonClass(index)}>
                  {stepStates[index] ? "✓" : index + 1}
                </button>
              </li>
            ))}
          </ol>
          <div aria-hidden="true" className="mx-[10%] mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-ocean-primary to-cyan-400 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <ol aria-label="Frame creation steps" className="mt-1 grid grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="min-w-0 px-0.5 text-center text-[8px] font-semibold leading-tight sm:px-1 sm:text-xs">
                <button type="button" onClick={() => navigateToStep(index)} disabled={index > furthestStep} aria-current={currentStep === index ? "step" : undefined} className={`min-h-9 w-full break-words rounded px-0.5 py-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:px-1 ${currentStep === index ? "text-ocean-deep" : stepStates[index] ? "text-emerald-600" : "text-slate-400"} disabled:cursor-not-allowed`}>
                  <span className="hidden sm:inline">{index + 1}. </span>{step.title}
                </button>
              </li>
            ))}
          </ol>
        </section>

        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col">
          {currentStep === 0 && (
            <section id="upload-step" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-sky-500/10 backdrop-blur sm:p-4" aria-labelledby="step-0-title">
              {stepHeader(0, "Upload your image", "Use any picture you like — an AI character, a photo, anything.")}
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="mb-3 flex shrink-0 items-center gap-3 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 px-3 py-2.5 text-left transition hover:border-ocean-primary hover:from-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:px-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-cyan-100">✨</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-ocean-deep sm:text-sm">Haven’t created your image yet? <span className="font-medium text-ocean-medium">(optional)</span></span>
                  <span className="block truncate text-[11px] text-slate-500 sm:text-xs">Follow the quick guide to generate your character image.</span>
                </span>
                <span className="shrink-0 rounded-lg bg-ocean-primary px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">View Instructions</span>
              </button>

              <label
                htmlFor="frame-photo"
                className={`group flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 text-center transition focus-within:ring-2 focus-within:ring-cyan-400 ${
                  isDragging ? "border-ocean-primary bg-cyan-100/70 scale-[1.01]" : "border-cyan-300 bg-gradient-to-b from-cyan-50/80 to-sky-50/60 hover:border-ocean-primary hover:from-cyan-50"
                }`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-ocean-primary shadow-sm ring-1 ring-cyan-100 transition group-hover:scale-105 sm:h-16 sm:w-16">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7 sm:h-8 sm:w-8">
                    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="flex flex-col items-center gap-1">
                  <span className="max-w-full truncate px-2 text-sm font-bold text-ocean-deep sm:text-base">
                    {photoName ? photoName : isDragging ? "Drop it here!" : "Choose an image or drag & drop it here"}
                  </span>
                  <span className="text-xs font-medium text-slate-500">PNG or JPG · stays on your device</span>
                </span>
                <span className="inline-flex min-h-10 items-center rounded-xl bg-ocean-primary px-4 text-sm font-bold text-white shadow-md shadow-cyan-500/25 transition group-hover:brightness-110">
                  {photoName ? "Change image" : "Browse files"}
                </span>
                <input id="frame-photo" type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
              </label>

              <div className="mt-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-emerald-500"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  100% private — your image never leaves this device.
                </p>
                <button type="button" onClick={nextStep} disabled={!photo} className={primaryButtonClass}>Next: Pick a caption <span aria-hidden="true">→</span></button>
              </div>
              {error && <p role="alert" className="mt-4 shrink-0 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            </section>
          )}

          {currentStep === 1 && (
            <section id="caption-step" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-sky-500/10 backdrop-blur sm:p-4" aria-labelledby="step-1-title">
              {stepHeader(1, "Select a caption", "Pick a caption that fits you")}
              <fieldset className="flex min-h-0 flex-1 flex-col">
                <legend className="sr-only">Available captions</legend>
                <div className="grid min-h-0 flex-1 grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  {FRAME_VARIANTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setVariant(item.id); setDownloaded(false); setError(""); }}
                      aria-pressed={variant === item.id}
                      className={`group relative flex min-h-0 min-w-0 flex-col items-stretch justify-center overflow-hidden rounded-2xl border-2 p-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:p-2.5 ${
                        variant === item.id
                          ? "border-ocean-primary bg-cyan-50/70 shadow-lg shadow-cyan-500/15 ring-2 ring-cyan-100"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
                      }`}
                    >
                      {variant === item.id && (
                        <span className="absolute right-1.5 top-1.5 z-10 inline-flex items-center gap-0.5 rounded-full bg-ocean-primary px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm sm:right-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[10px]">
                          <span aria-hidden="true">✓</span> Selected
                        </span>
                      )}
                      <span className={`flex min-h-24 flex-1 items-center justify-center overflow-hidden rounded-xl p-1 transition sm:min-h-32 ${variant === item.id ? "bg-gradient-to-b from-cyan-100 to-sky-50" : "bg-slate-50 group-hover:bg-cyan-50/60"}`}>
                        <FrameThumb format={format} variant={item.id} />
                      </span>
                      <span className="mt-1.5 block shrink-0 text-center text-[11px] font-semibold leading-tight text-ocean-deep sm:mt-4 sm:text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              {error && <p role="alert" className="mt-4 shrink-0 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="mt-3 flex shrink-0 flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-between sm:gap-3">
                <button type="button" onClick={previousStep} className={secondaryButtonClass}><span aria-hidden="true">←</span> Previous</button>
                <button type="button" onClick={nextStep} disabled={!variant} className={primaryButtonClass}>Next: Adjust photo <span aria-hidden="true">→</span></button>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section id="adjust-step" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-sky-500/10 backdrop-blur sm:p-4" aria-labelledby="step-2-title">
              {stepHeader(
                2,
                "Adjust your photo",
                "Move and zoom until it sits perfectly inside the frame.",
                <button type="button" onClick={resetAdjustment} disabled={!photo} aria-label="Reset photo to automatic fit" title="Reset photo to automatic fit" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-white text-ocean-primary shadow-sm transition hover:border-cyan-400 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary disabled:cursor-not-allowed disabled:opacity-40">
                  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none"><path d="M4.2 8a6 6 0 1 1-.1 4M4 4.5V8h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
              {photo ? (
                <div className="flex min-h-0 flex-1 items-center justify-center">{previewCanvas(true, "AI Ocean frame preview — drag to reposition")}</div>
              ) : (
                <div className="mx-auto flex min-h-0 max-w-[460px] flex-1 items-center justify-center rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 px-4 text-center text-sm text-slate-500">Upload an image first to preview your frame.</div>
              )}
              <div className="mt-3 flex shrink-0 items-center gap-3 rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50/80 to-sky-50/60 px-3 py-2">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-ocean-primary"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="M16 16l4 4M8.5 11h5M11 8.5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  disabled={!photo}
                  onChange={(event) => { setZoom(clampZoom(Number(event.target.value))); setDownloaded(false); }}
                  aria-label="Photo zoom"
                  className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-ocean-primary disabled:cursor-not-allowed"
                />
                <span className="w-12 shrink-0 text-right text-xs font-bold tabular-nums text-ocean-deep">{Math.round(zoom * 100)}%</span>
              </div>
              <p className="mt-1.5 shrink-0 text-center text-[10px] leading-tight text-slate-500 sm:text-xs">
                Drag to reposition · pinch or scroll to zoom.
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-ocean-medium">Previewing {frameFormat.label} · format comes next</span>
              </p>
              <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 pt-1 sm:mt-3 sm:flex-row sm:justify-between sm:gap-3">
                <button type="button" onClick={previousStep} className={secondaryButtonClass}><span aria-hidden="true">←</span> Previous</button>
                <button type="button" onClick={nextStep} disabled={!photo || !variant} className={primaryButtonClass}>Next: Format &amp; download <span aria-hidden="true">→</span></button>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section id="format-step" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-sky-500/10 backdrop-blur sm:p-4" aria-labelledby="step-3-title">
              {stepHeader(3, "Format & download", "Pick the size that matches where you will post it, then save the PNG.")}
              <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:gap-3 lg:w-[46%] lg:grid-cols-1">
                  {FORMAT_ORDER.map((id) => {
                    const fmt = FRAME_FORMATS[id];
                    const active = format === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => { setFormat(id); setDownloaded(false); }}
                        aria-pressed={active}
                        className={`relative flex items-center gap-3 rounded-2xl border-2 p-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:gap-4 sm:p-3 ${
                          active ? "border-ocean-primary bg-cyan-50/70 shadow-md shadow-cyan-500/15 ring-2 ring-cyan-100" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
                        }`}
                      >
                        {active && (
                          <span className="absolute right-1.5 top-1.5 z-10 inline-flex items-center gap-0.5 rounded-full bg-ocean-primary px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm sm:right-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[10px]">
                            <span aria-hidden="true">✓</span> Selected
                          </span>
                        )}
                        <span className="flex h-24 shrink-0 items-center justify-center sm:h-28">
                          <FrameThumb format={id} variant={variant ?? "building"} boxClassName="h-full w-auto" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ocean-deep sm:text-base">{fmt.label}</span>
                          <span className="block text-xs font-semibold text-ocean-medium">{fmt.badge} · {fmt.outWidth}×{fmt.outHeight}</span>
                          <span className="mt-0.5 hidden text-xs leading-snug text-slate-500 sm:block">{fmt.use}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-cyan-100 bg-gradient-to-b from-cyan-50/70 to-sky-50/50 p-2 sm:p-3">
                  {photo && variant ? previewCanvas(false, `Preview in ${frameFormat.label} format`) : (
                    <div className="max-w-[320px] px-4 text-center text-sm text-slate-500">Upload an image and pick a caption to see the preview.</div>
                  )}
                </div>
              </div>
              {downloaded && (
                <div role="status" className="mt-4 flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2.5 text-xs font-medium text-emerald-800 sm:px-4 sm:text-sm">
                  <span aria-hidden="true">🎉</span> Saved! Change the caption or format and download again anytime.
                </div>
              )}
              {error && <p role="alert" className="mt-3 shrink-0 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700 sm:text-sm">{error}</p>}
              <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 pt-1 sm:mt-3 sm:flex-row sm:justify-between sm:gap-3">
                <button type="button" onClick={previousStep} className={secondaryButtonClass}><span aria-hidden="true">←</span> Previous</button>
                <button type="button" onClick={download} disabled={!photo || !variant || exporting} className={primaryButtonClass}>
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 18h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {exporting ? "Preparing your PNG…" : downloaded ? "Download again" : "Download framed photo"}
                  </span>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      <GuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </main>
  );
}

export default function FrameGeneratorPage() {
  return <FrameGenerator />;
}
