"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import buildingFrame from "@/app/assets/frames/Ai Frame I’m building.png";
import surfingFrame from "@/app/assets/frames/Ai Frame I’m surfing.png";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const WIDTH = 1080;
const HEIGHT = 1350;
// Photo opening measured against the supplied 2400 × 3000 frame artwork.
const OPENING = { x: 138, y: 150, width: 2122, height: 1780 };
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistanceRef = useRef<number | null>(null);
  const frame = FRAMES.find((item) => item.id === frameId) ?? FRAMES[0];
  const stepStates = [Boolean(photo), Boolean(photo && frameId), adjustmentComplete, downloaded];
  const furthestStep = !photo ? 0 : !frameId ? 1 : !adjustmentComplete ? 2 : 3;

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

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
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

  return (
    <main className="h-screen h-[100dvh] min-h-0 overflow-hidden bg-gradient-to-br from-gray-50 to-cyan-50 px-3 py-2 sm:px-6 sm:py-3">
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden">
        <header className="mb-2 flex shrink-0 flex-col gap-0.5 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/dashboard" className="inline-flex min-h-8 items-center text-xs font-semibold text-ocean-primary hover:underline sm:min-h-10 sm:text-sm">← Dashboard</Link>
          <h1 className="font-syncopate text-base font-bold text-ocean-deep sm:text-lg">Create your event frame</h1>
        </header>

        <section aria-label="Frame creation progress" className="mx-auto mb-2 w-full max-w-5xl shrink-0 rounded-2xl border border-sky-100 bg-white/95 p-2.5 shadow-sm backdrop-blur sm:mb-3 sm:p-4">
          <div>
            <div>
              <ol aria-label="Step navigation" className="grid grid-cols-4">
                {["Add Photo", "Choose Frame", "Adjust Photo", "Download"].map((title, index) => (
                  <li key={title} className="flex justify-center">
                    <button type="button" onClick={() => navigateToStep(index)} disabled={index > furthestStep} aria-current={currentStep === index ? "step" : undefined} aria-label={`${stepStates[index] ? "Completed step" : currentStep === index ? "Current step" : "Step"} ${index + 1}: ${title}`} className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:h-10 sm:w-10 ${currentStep === index ? (stepStates[index] ? "bg-emerald-500 text-white ring-4 ring-sky-100" : "bg-sky-500 text-white ring-4 ring-sky-100") : stepStates[index] ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-slate-100 text-slate-500"} disabled:cursor-not-allowed`}>
                      {stepStates[index] ? "✓" : index + 1}
                    </button>
                  </li>
                ))}
              </ol>
              <div aria-hidden="true" className="mx-[12.5%] mt-2 flex">
                {stepStates.slice(0, 3).map((complete, index) => <span key={index} className={`h-[3px] flex-1 ${index === 0 ? "rounded-l-full" : ""} ${index === 2 ? "rounded-r-full" : ""} ${complete ? "bg-emerald-500" : "bg-slate-200"}`} />)}
              </div>
              <ol aria-label="Frame creation steps" className="mt-1 grid grid-cols-4">
                {["Add Photo", "Choose Frame", "Adjust Photo", "Download"].map((title, index) => (
                  <li key={title} className="min-w-0 px-0.5 text-center text-[9px] font-semibold leading-tight sm:px-1 sm:text-sm">
                    <button type="button" onClick={() => navigateToStep(index)} disabled={index > furthestStep} aria-current={currentStep === index ? "step" : undefined} className={`min-h-11 w-full break-words rounded px-0.5 py-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:px-1 ${currentStep === index || stepStates[index] ? "text-sky-700" : "text-slate-400"} disabled:cursor-not-allowed`}>{title}</button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <p className="mt-1 text-[10px] font-medium leading-tight text-sky-700 sm:text-xs">{downloaded ? "Ready to share — select any step to revisit it" : ["Add a photo to get started", "Choose a frame to continue", "Adjust your photo, then download", "Your framed photo is ready to download"][currentStep]}</p>
        </section>

        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col">
            {currentStep === 0 && <section id="add-photo-step" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-5" aria-labelledby="upload-title">
              <div className="mb-2 flex shrink-0 items-start gap-3 sm:mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 font-bold text-ocean-primary">1</span>
                <div><h2 id="upload-title" className="font-bold text-ocean-deep">Add your photo</h2><p className="mt-1 text-sm text-slate-500">A square photo works best. You can reposition it next.</p></div>
              </div>
              <label htmlFor="frame-photo" className="flex min-h-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed border-cyan-300 bg-cyan-50/60 px-4 py-2 text-center text-sm font-semibold text-ocean-primary transition hover:bg-cyan-50 focus-within:ring-2 focus-within:ring-cyan-400">
                <span className="truncate">{photoName || "Choose a photo from your device"}</span>
                <input id="frame-photo" type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
              </label>
              <p className="mt-2 shrink-0 text-xs text-slate-500">Your photo stays on this device; it isn’t uploaded.</p>
              {error && <p role="alert" className="mt-2 shrink-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="mt-auto flex justify-end pt-3">
                <button type="button" onClick={nextStep} disabled={!photo} className="min-h-12 w-full rounded-xl bg-ocean-primary px-5 py-3 font-bold text-white transition hover:bg-ocean-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto">Next: Choose frame <span aria-hidden="true">→</span></button>
              </div>
            </section>}

            {currentStep === 1 && <section id="choose-frame-step" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-5" aria-labelledby="choose-title">
              <div className="mb-2 flex shrink-0 items-start gap-3 sm:mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 font-bold text-ocean-primary">2</span>
                <div><h2 id="choose-title" className="font-bold text-ocean-deep">Choose your frame</h2><p className="mt-1 text-sm text-slate-500">Pick the one that feels like you.</p></div>
              </div>
              <fieldset className="flex min-h-0 flex-1 flex-col">
                <legend className="sr-only">Available event frames</legend>
                <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-4">
                {FRAMES.map((item) => (
                  <button key={item.id} type="button" onClick={() => { setFrameId(item.id); setDownloaded(false); setError(""); }} aria-pressed={frameId === item.id}
                    className={`relative flex min-h-0 min-w-0 flex-col items-stretch rounded-xl border-2 p-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:p-3 ${frameId === item.id ? "border-ocean-primary bg-cyan-50/50 ring-2 ring-cyan-100" : "border-slate-200 hover:border-cyan-300"}`}>
                    {frameId === item.id && <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-ocean-primary px-2 py-1 text-[10px] font-bold text-white shadow-sm"><span aria-hidden="true">✓</span> Selected</span>}
                    <img src={item.image.src} alt="" className="h-0 min-h-0 w-full flex-1 rounded-lg object-contain" />
                    <span className="mt-1 block shrink-0 text-center text-xs font-semibold leading-tight text-ocean-deep sm:mt-2 sm:text-sm">{item.label}</span>
                  </button>
                ))}
                </div>
              </fieldset>
              <div className="mt-2 flex shrink-0 flex-col-reverse gap-2 pt-1 sm:mt-3 sm:flex-row sm:justify-between sm:gap-3">
                <button type="button" onClick={previousStep} className="min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-5 py-2 font-semibold text-ocean-primary transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:w-auto sm:py-3"><span aria-hidden="true">←</span> Previous</button>
                <button type="button" onClick={nextStep} disabled={!frameId} className="min-h-11 w-full rounded-xl bg-ocean-primary px-5 py-2 font-bold text-white transition hover:bg-ocean-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:py-3">Next: Adjust photo <span aria-hidden="true">→</span></button>
              </div>
            </section>}
          {currentStep === 2 && <section id="adjust-photo-step" className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition-colors sm:p-5 ${photo ? "border-cyan-200 shadow-md" : "border-slate-100"}`} aria-labelledby="preview-title">
            <div className="mb-2 flex shrink-0 items-start gap-3 sm:mb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 font-bold text-ocean-primary">3</span>
              <div className="min-w-0 flex-1"><h2 id="preview-title" className="font-bold text-ocean-deep">Adjust your photo</h2><p className="mt-1 text-sm text-slate-500">Move and zoom your photo to fit the frame.</p></div>
              <button type="button" onClick={resetAdjustment} disabled={!photo} aria-label="Reset photo to automatic fit" title="Reset photo to automatic fit" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-white text-ocean-primary shadow-sm transition hover:border-cyan-400 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary disabled:cursor-not-allowed disabled:opacity-40">
                <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none"><path d="M4.2 8a6 6 0 1 1-.1 4M4 4.5V8h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            {photo ? (
              <div className="flex min-h-0 flex-1 items-center justify-center">
              <canvas ref={canvasRef} onPointerDown={handlePreviewPointerDown} onPointerMove={handlePreviewPointerMove}
                onPointerUp={handlePreviewPointerEnd} onPointerCancel={handlePreviewPointerEnd}
                onWheel={handleWheelZoom} className="block h-full w-auto max-h-full max-w-full rounded-xl bg-cyan-50 aspect-[4/5] cursor-grab touch-none active:cursor-grabbing" aria-label="Generated AI Ocean frame preview" />
              </div>
            ) : (
              <div className="mx-auto flex min-h-0 max-w-[460px] flex-1 items-center justify-center rounded-xl border border-dashed border-cyan-200 bg-cyan-50/60 px-4 text-center text-sm text-slate-500">Add a photo above to preview your frame.</div>
            )}
            <p className="mt-1 shrink-0 text-center text-[10px] leading-tight text-slate-500 sm:mt-2 sm:text-xs">Drag to reposition · pinch to zoom on mobile · scroll to zoom on desktop.</p>
            <div className="mt-2 flex shrink-0 flex-col-reverse gap-2 pt-1 sm:mt-3 sm:flex-row sm:justify-between sm:gap-3">
              <button type="button" onClick={previousStep} className="min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-5 py-2 font-semibold text-ocean-primary transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:w-auto sm:py-3"><span aria-hidden="true">←</span> Previous</button>
              <button type="button" onClick={nextStep} className="min-h-11 w-full rounded-xl bg-ocean-primary px-5 py-2 font-bold text-white transition hover:bg-ocean-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:w-auto sm:py-3">Next: Download <span aria-hidden="true">→</span></button>
            </div>
          </section>}

          {currentStep === 3 && <section id="download-step" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-5" aria-labelledby="download-title">
            <div className="flex shrink-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 font-bold text-ocean-primary">4</span>
              <div><h2 id="download-title" className="font-bold text-ocean-deep">Download your photo</h2><p className="mt-1 text-sm text-slate-500">Save your finished frame as a PNG, ready to share.</p></div>
            </div>
            {photo && frameId && <div className="flex min-h-0 flex-1 items-center justify-center py-2"><canvas ref={canvasRef} className="block h-full w-auto max-h-full max-w-full rounded-xl bg-cyan-50 aspect-[4/5]" aria-label="Finished AI Ocean frame preview" /></div>}
            {downloaded && <p role="status" className="mt-1 shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 sm:mt-2 sm:px-4 sm:text-sm">Your framed photo is ready. You can adjust it and download again anytime.</p>}
            <div className="mt-2 flex shrink-0 flex-col-reverse gap-2 pt-1 sm:mt-3 sm:flex-row sm:justify-between sm:gap-3">
              <button type="button" onClick={previousStep} className="min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-5 py-2 font-semibold text-ocean-primary transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary sm:w-auto sm:py-3"><span aria-hidden="true">←</span> Previous</button>
              <button type="button" onClick={download} disabled={!photo || !frameId} className="min-h-11 w-full rounded-xl bg-ocean-primary px-5 py-2 font-bold text-white transition hover:bg-ocean-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-primary disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:py-3">{downloaded ? "Download again" : "Download framed photo"}</button>
            </div>
          </section>}
        </div>
      </div>
    </main>
  );
}

export default function FrameGeneratorPage() {
  return <AuthGuard><FrameGenerator /></AuthGuard>;
}
