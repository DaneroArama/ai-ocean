import { ConvexError } from "convex/values";

export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

function formatMegabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
}

/** Returns a user-facing message when the file is not acceptable, otherwise null. */
export function validateReceiptFile(file: File): string | null {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isImage && !isPdf) {
    return "❌ Unsupported file type. Please upload an image (PNG/JPG) or a PDF.";
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return `❌ File is too large (${formatMegabytes(file.size)} MB). The maximum size is 10 MB.`;
  }
  return null;
}

async function readUploadError(response: Response): Promise<string | null> {
  try {
    const text = await response.text();
    if (!text) return null;
    try {
      const parsed = JSON.parse(text) as { error?: unknown; message?: unknown };
      const message = parsed.error ?? parsed.message;
      if (typeof message === "string" && message) return message;
    } catch {
      // not JSON — fall through to the raw text
    }
    return text.length <= 200 ? text : null;
  } catch {
    return null;
  }
}

/** POSTs the file to a Convex upload URL and returns the storage id. */
export async function uploadReceiptFile(uploadUrl: string, file: File): Promise<string> {
  let response: Response;
  try {
    response = await fetch(uploadUrl, { method: "POST", body: file });
  } catch {
    throw new Error("Could not reach the upload server. Check your connection and try again.");
  }
  if (!response.ok) {
    const detail = await readUploadError(response);
    throw new Error(detail ?? `Upload failed (${response.status}). Please try again.`);
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const storageId = (payload as { storageId?: unknown } | null)?.storageId;
  if (typeof storageId !== "string") {
    throw new Error("Upload failed. Please try again.");
  }
  return storageId;
}

function messageFromErrorData(data: unknown): string | null {
  if (typeof data === "string" && data) return data;
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return null;
}

/** Turns Convex/network errors into a short message safe to show to users. */
export function friendlyErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ConvexError) {
    const message = messageFromErrorData(error.data);
    if (message) return `❌ ${message}`;
    return `❌ ${fallback}`;
  }
  if (error instanceof Error && error.message) {
    const message = error.message;
    if (/too large|maximum size|1 MiB/i.test(message)) {
      return "❌ File is too large. The maximum size is 10 MB.";
    }
    if (/\[CONVEX|Server Error/i.test(message)) {
      return `❌ ${fallback}`;
    }
    return `❌ ${message}`;
  }
  return `❌ ${fallback}`;
}
