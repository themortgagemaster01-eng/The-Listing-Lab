/**
 * Client-side image downscale/re-encode helper for the Photo Manager
 * (Phase 2 spec item #3) — deliberately dependency-free (Canvas API only,
 * no react-dropzone/browser-image-compression/etc.) per the "keep this
 * lightweight" constraint in the brief.
 *
 * Long edge is capped at `maxDimension` and re-encoded as JPEG at `quality`
 * before ever touching state/localStorage/Supabase Storage — this keeps
 * mock-mode `localStorage` usage (which has to hold full data URLs) well
 * within quota, and keeps real uploads fast.
 */
export interface ResizedImage {
  dataUrl: string;
  width: number;
  height: number;
  /** Approximate encoded size in bytes, derived from the base64 payload length. */
  byteSize: number;
}

function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}

export async function resizeImageFile(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<ResizedImage> {
  const maxDimension = options.maxDimension ?? 2400;
  const quality = options.quality ?? 0.82;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);

    let { width, height } = image;
    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        height = Math.round((height / width) * maxDimension);
        width = maxDimension;
      } else {
        width = Math.round((width / height) * maxDimension);
        height = maxDimension;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context unavailable — falling back to the original file.");
    }
    ctx.drawImage(image, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return { dataUrl, width, height, byteSize: dataUrlByteSize(dataUrl) };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the selected image file."));
    img.src = src;
  });
}
