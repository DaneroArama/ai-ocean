"use client";

import buildingFrame from "@/app/assets/frames/Ai Frame I’m building.png";
import surfingFrame from "@/app/assets/frames/Ai Frame I’m surfing.png";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { useEffect, useRef, useState } from "react";

const WIDTH = 1080;
const HEIGHT = 1350;
// Photo opening measured against the supplied 2400 × 3000 frame artwork.
const OPENING = { x: 138, y: 150, width: 2122, height: 1780 };
const STEP_TITLES = ["Add Photo", "Choose Frame", "Adjust Photo", "Download"];
const STEP_HINTS = [
  "Add a photo to get started",
  "Choose a frame to continue",
  "Adjust your photo, then download",
  "Your framed photo is ready to download",
];
const FRAMES = [
  { id: "building", label: "I’m building", image: buildingFrame },
  { id: "surfing", label: "I’m surfing", image: surfingFrame },
] as const;

/** These supplied frames have an opaque black photo opening. Clear only the
 * connected black region at the center, preserving the other black artwork. */
function makeFrameOpeningTransparent(frame: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = frame.naturalWidth;
  canvas.height = frame.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return canvas;
  context.drawImage(frame, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = pixels;
  const total = canvas.width * canvas.height;
  const queue = new Int32Array(total);
  const startX = Math.floor(canvas.width / 2);
  const startY = Math.floor(canvas.height * 0.34);
  const start = startY * canvas.width + startX;
  const isOpeningPixel = (pixel: number) => {
    const offset = pixel * 4;
    return data[offset + 3] > 0 && data[offset] < 24 && data[offset + 1] < 24 && data[offset + 2] < 24;
  };

  if (isOpeningPixel(start)) {
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    data[start * 4 + 3] = 0;
    while (head < tail) {
      const pixel = queue[head++];
      const x = pixel % canvas.width;
      const left = x > 0 ? pixel - 1 : -1;
      const right = x < canvas.width - 1 ? pixel + 1 : -1;
      const up = pixel >= canvas.width ? pixel - canvas.width : -1;
      const down = pixel < total - canvas.width ? pixel + canvas.width : -1;
      if (left >= 0 && isOpeningPixel(left)) { data[left * 4 + 3] = 0; queue[tail++] = left; }
      if (right >= 0 && isOpeningPixel(right)) { data[right * 4 + 3] = 0; queue[tail++] = right; }
      if (up >= 0 && isOpeningPixel(up)) { data[up * 4 + 3] = 0; queue[tail++] = up; }
      if (down >= 0 && isOpeningPixel(down)) { data[down * 4 + 3] = 0; queue[tail++] = down; }
    }
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

function FrameGenerator() {
  const { isAuthenticated } = useConvexAuth();
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [frameId, setFrameId] = useState<string | null>(null);
  const [frameOverlay, setFrameOverlay] = useState<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [downloaded, setDownloaded] = useState(false);
  const [adjustmentComplete, setAdjustmentComplete] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistanceRef = useRef<number | null>(null);
  const frame = FRAMES.find((item) => item.id === frameId) ?? FRAMES[0];
  const stepStates = [Boolean(photo), Boolean(photo && frameId), adjustmentComplete, downloaded];
  const furthestStep = !photo ? 0 : !frameId ? 1 : !adjustmentComplete ? 2 : 3;
  const progress = Math.max(stepStates.filter(Boolean).length / 4, furthestStep / 3) * 100;

  const navigateToStep = (index: number) => {
    if (index > furthestStep) return;
    setCurrentStep(index);
  };

  const nextStep = () => {
    const next = currentStep + 1;
    if (next > furthestStep && !(currentStep === 2 && photo && frameId)) return;
    if (currentStep === 2) setAdjustmentComplete(true);
    setCurrentStep(next);
  };

  const previousStep = () => setCurrentStep((step) => Math.max(0, step - 1));

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) setFrameOverlay(makeFrameOpeningTransparent(image));
    };
    image.onerror = () => {
      if (!cancelled) setError("The selected frame could not be loaded.");
    };
    image.src = frame.image.src;
    return () => { cancelled = true; };
  }, [frame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#DDF5F4");
    gradient.addColorStop(1, "#A8DDE5");
    context.fillStyle = gradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    if (photo) {
      const outputX = (OPENING.x / 2400) * WIDTH;
      const outputY = (OPENING.y / 3000) * HEIGHT;
      const outputWidth = (OPENING.width / 2400) * WIDTH;
      const outputHeight = (OPENING.height / 3000) * HEIGHT;
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
      context.fillText("Upload a photo to preview your frame", WIDTH / 2, HEIGHT / 2);
    }
    if (frameOverlay && frameId) context.drawImage(frameOverlay, 0, 0, WIDTH, HEIGHT);
  }, [photo, frameOverlay, frameId, position, zoom, currentStep]);

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
      setCurrentStep(0);
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError("That image could not be opened. Try another photo.");
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

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !photo || !frameId) {
      setError(!photo ? "Add a photo to continue." : "Choose a frame to continue.");
      return;
    }
    const link = document.createElement("a");
    link.download = `ai-ocean-${frameId}-frame.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloaded(true);
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
    const dx = (event.clientX - previous.x) * (WIDTH / rect.width);
    const dy = (event.clientY - previous.y) * (HEIGHT / rect.height);
    const outputWidth = (OPENING.width / 2400) * WIDTH;
    const outputHeight = (OPENING.height / 3000) * HEIGHT;
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
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-50 to-sky-100 font-bold text-ocean-primary ring-1 ring-cyan-100">{index}</span>
      <div className="min-w-0 flex-1">
        <h2 id={`step-${index}-title`} className="font-bold text-ocean-deep">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
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
              
            </div>
          
          </div>
          <div className="mt-1.5 flex items-end justify-between gap-3 sm:mt-2">
            <div className="min-w-0">
              <h1 className="font-syncopate text-base font-bold leading-tight text-ocean-deep sm:text-xl">
                Create your <span className="bg-gradient-to-r from-ocean-primary via-sky-500 to-cyan-400 bg-clip-text text-transparent">event frame</span>
              </h1>
              <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">Add a photo, pick a frame, download it — everything happens right in your browser.</p>
            </div>
          </div>
        </header>

        <section aria-label="Frame creation progress" className="mx-auto mb-2 w-full max-w-5xl shrink-0 rounded-2xl border border-white/70 bg-white/90 p-2.5 shadow-lg shadow-sky-500/5 backdrop-blur sm:mb-3 sm:p-4">
          <ol aria-label="Step navigation" className="grid grid-cols-4">
            {STEP_TITLES.map((title, index) => (
              <li key={title} className="flex justify-center">
                <button type="button" onClick={() => navigateToStep(index)} disabled={index > furthestStep} aria-current={currentStep === index ? "step" : undefined} aria-label={`${stepStates[index] ? "Completed step" : currentStep === index ? "Current step" : "Step"} ${index + 1}: ${title}`} className={stepButtonClass(index)}>
                  {stepStates[index] ? "✓" : index + 1}
                </button>
              </li>
            ))}
          </ol>
          <div aria-hidden="true" className="mx-[12.5%] mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-ocean-primary to-cyan-400 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <ol aria-label="Frame creation steps" className="mt-1 grid grid-cols-4">
            {STEP_TITLES.map((title, index) => (
              <li key={title} className="min-w-0 px-0.5 text-center text-[9px] font-semibold leading-tight sm:px-1 sm:text-xs">
                <button type="button" onClick={() => navigateToStep(index)} disabled={index > furthestStep} aria-current={currentStep === index ? "step" : undefined} className={`min-h-9 w-full break-words rounded px-0.5 py-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:px-1 ${currentStep === index ? "text-ocean-deep" : stepStates[index] ? "text-emerald-600" : "text-slate-400"} disabled:cursor-not-allowed`}>
                  <span className="hidden sm:inline">{index + 1}. </span>{title}
                </button>
              </li>
            ))}
          </ol>
          <p aria-live="polite" className={`mt-1 text-center text-[10px] font-medium leading-tight sm:text-xs ${downloaded ? "text-emerald-600" : "text-ocean-medium"}`}>{downloaded ? "Ready to share — select any step to revisit it" : STEP_HINTS[currentStep]}</p>
        </section>

        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col">
          {currentStep === 0 && (
            <section id="add-photo-step" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-sky-500/10 backdrop-blur sm:p-5" aria-labelledby="step-0-title">
              {stepHeader(0, "Add your photo", "A square photo works best. You can reposition it next.")}
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
                    {photoName ? photoName : isDragging ? "Drop it here!" : "Choose a photo or drag & drop it here"}
                  </span>
                  <span className="text-xs font-medium text-slate-500 sm:text-sm">PNG or JPG · stays on your device</span>
                </span>
                <span className="inline-flex min-h-10 items-center rounded-xl bg-ocean-primary px-4 text-sm font-bold text-white shadow-md shadow-cyan-500/25 transition group-hover:brightness-110">
                  {photoName ? "Change photo" : "Browse files"}
                </span>
                <input id="frame-photo" type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
              </label>
              <div className="mt-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-emerald-500"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  100% private — your photo never leaves this device.
                </p>
                <button type="button" onClick={nextStep} disabled={!photo} className={primaryButtonClass}>Next: Choose frame <span aria-hidden="true">→</span></button>
              </div>
              {error && <p role="alert" className="mt-2 shrink-0 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            </section>
          )}

          {currentStep === 1 && (
            <section id="choose-frame-step" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-sky-500/10 backdrop-blur sm:p-5" aria-labelledby="step-1-title">
              {stepHeader(1, "Choose your frame", "Pick the one that feels like you.")}
              <fieldset className="flex min-h-0 flex-1 flex-col">
                <legend className="sr-only">Available event frames</legend>
                <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-4">
                  {FRAMES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setFrameId(item.id); setDownloaded(false); setError(""); }}
                      aria-pressed={frameId === item.id}
                      className={`group relative flex min-h-0 min-w-0 flex-col items-stretch overflow-hidden rounded-2xl border-2 p-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:p-3 ${
                        frameId === item.id
                          ? "border-ocean-primary bg-cyan-50/70 shadow-lg shadow-cyan-500/15 ring-2 ring-cyan-100"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
                      }`}
                    >
                      {frameId === item.id && (
                        <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-ocean-primary px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                          <span aria-hidden="true">✓</span> Selected
                        </span>
                      )}
                      <span className={`flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl p-1 transition ${frameId === item.id ? "bg-gradient-to-b from-cyan-100 to-sky-50" : "bg-slate-50 group-hover:bg-cyan-50/60"}`}>
                        <img src={item.image.src} alt="" className="max-h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]" />
                      </span>
                      <span className="mt-1.5 block shrink-0 text-center text-xs font-semibold leading-tight text-ocean-deep sm:mt-2 sm:text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              {error && <p role="alert" className="mt-2 shrink-0 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="mt-3 flex shrink-0 flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-between sm:gap-3">
                <button type="button" onClick={previousStep} className={secondaryButtonClass}><span aria-hidden="true">←</span> Previous</button>
                <button type="button" onClick={nextStep} disabled={!frameId} className={primaryButtonClass}>Next: Adjust photo <span aria-hidden="true">→</span></button>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section id="adjust-photo-step" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-sky-500/10 backdrop-blur sm:p-5" aria-labelledby="step-2-title">
              {stepHeader(
                2,
                "Adjust your photo",
                "Move and zoom your photo to fit the frame.",
                <button type="button" onClick={resetAdjustment} disabled={!photo} aria-label="Reset photo to automatic fit" title="Reset photo to automatic fit" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-white text-ocean-primary shadow-sm transition hover:border-cyan-400 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary disabled:cursor-not-allowed disabled:opacity-40">
                  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none"><path d="M4.2 8a6 6 0 1 1-.1 4M4 4.5V8h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
              {photo ? (
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePreviewPointerDown}
                    onPointerMove={handlePreviewPointerMove}
                    onPointerUp={handlePreviewPointerEnd}
                    onPointerCancel={handlePreviewPointerEnd}
                    onWheel={handleWheelZoom}
                    className="block aspect-[4/5] h-full max-h-full w-auto max-w-full cursor-grab rounded-2xl bg-cyan-50 shadow-lg ring-1 ring-slate-200/80 touch-none active:cursor-grabbing"
                    aria-label="Generated AI Ocean frame preview"
                  />
                </div>
              ) : (
                <div className="mx-auto flex min-h-0 max-w-[460px] flex-1 items-center justify-center rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 px-4 text-center text-sm text-slate-500">Add a photo first to preview your frame.</div>
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
              <p className="mt-1.5 shrink-0 text-center text-[10px] leading-tight text-slate-500 sm:text-xs">Drag to reposition · pinch or scroll to zoom · use the slider for fine control.</p>
              <div className="mt-2 flex shrink-0 flex-col-reverse gap-2 pt-1 sm:mt-3 sm:flex-row sm:justify-between sm:gap-3">
                <button type="button" onClick={previousStep} className={secondaryButtonClass}><span aria-hidden="true">←</span> Previous</button>
                <button type="button" onClick={nextStep} className={primaryButtonClass}>Next: Download <span aria-hidden="true">→</span></button>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section id="download-step" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-sky-500/10 backdrop-blur sm:p-5" aria-labelledby="step-3-title">
              {stepHeader(3, "Download your photo", "Save your finished frame as a PNG, ready to share.")}
              {photo && frameId && (
                <div className="flex min-h-0 flex-1 items-center justify-center py-1">
                  <canvas ref={canvasRef} className="block aspect-[4/5] h-full max-h-full w-auto max-w-full rounded-2xl bg-cyan-50 shadow-lg ring-1 ring-slate-200/80" aria-label="Finished AI Ocean frame preview" />
                </div>
              )}
              {downloaded && (
                <div role="status" className="mt-2 flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2.5 text-xs font-medium text-emerald-800 sm:px-4 sm:text-sm">
                  <span aria-hidden="true">🎉</span> Your framed photo is saved. Adjust it and download again anytime.
                </div>
              )}
              <div className="mt-2 flex shrink-0 flex-col-reverse gap-2 pt-1 sm:mt-3 sm:flex-row sm:justify-between sm:gap-3">
                <button type="button" onClick={previousStep} className={secondaryButtonClass}><span aria-hidden="true">←</span> Previous</button>
                <button type="button" onClick={download} disabled={!photo || !frameId} className={primaryButtonClass}>
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 18h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {downloaded ? "Download again" : "Download framed photo"}
                  </span>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default function FrameGeneratorPage() {
  return <FrameGenerator />;
}
