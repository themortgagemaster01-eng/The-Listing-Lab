/**
 * Client-only helpers for turning a File the user picks/photographs into an
 * in-memory `IncomeDocumentInput` ready to send to `/api/ai/analyze-income`.
 *
 * Everything here runs in the browser and touches only `File`/`Blob`/
 * `HTMLCanvasElement` — nothing is written to disk, IndexedDB, or
 * localStorage. Images are downscaled/re-compressed client-side before
 * upload for two practical reasons: (1) phone camera photos are routinely
 * 3-8MB and Vercel serverless functions cap request bodies around 4.5MB, so
 * an uncompressed multi-document batch would fail outright; (2) the vision
 * model doesn't need (and is slower/pricier with) full-resolution images —
 * a document photo easily reads at ~1400px on the long edge.
 */

import type { IncomeDocType } from "@/lib/income/types";

export const MAX_DOCUMENTS = 8;
/** Hard cap per file after any client-side compression — keeps a full batch comfortably under Vercel's request body limit. */
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1400;
const IMAGE_JPEG_QUALITY = 0.75;

export class UploadPrepError extends Error {}

function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image."));
    img.src = dataUrl;
  });
}

/** Downscales+re-encodes an image File to a JPEG data URL under `MAX_IMAGE_DIMENSION` on its long edge. */
async function compressImage(file: File): Promise<string> {
  const original = await readFileAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return original; // canvas unsupported for some reason — fall back to the original data URL rather than fail the upload

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", IMAGE_JPEG_QUALITY);
}

/** Turns one picked/captured File into an upload-ready payload. Throws `UploadPrepError` with a user-facing message for unsupported types or oversized PDFs. */
export async function prepareIncomeDocument(
  file: File,
  docType: IncomeDocType
): Promise<{ id: string; fileName: string; mimeType: string; docType: IncomeDocType; dataUrl: string; previewUrl: string }> {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  if (!isImage && !isPdf) {
    throw new UploadPrepError(`"${file.name}" isn't a supported file type — upload a photo or a PDF.`);
  }

  let dataUrl: string;
  if (isImage) {
    dataUrl = await compressImage(file);
  } else {
    if (file.size > MAX_FILE_BYTES) {
      throw new UploadPrepError(`"${file.name}" is too large (${Math.round(file.size / 1024 / 1024)}MB) — PDFs must be under 4MB.`);
    }
    dataUrl = await readFileAsDataUrl(file);
  }

  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    fileName: file.name,
    mimeType: isImage ? "image/jpeg" : file.type,
    docType,
    dataUrl,
    previewUrl: isImage ? dataUrl : "",
  };
}
