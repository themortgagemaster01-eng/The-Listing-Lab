"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Star, Trash2, UploadCloud } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FlyerAutoSaveIndicator, type SaveStatus } from "@/components/property/flyer/FlyerAutoSaveIndicator";
import { resizeImageFile } from "@/lib/flyer/image-resize";
import type { FlyerPhoto } from "@/lib/flyer/types";
import { cn } from "@/lib/utils";

interface FlyerPhotoManagerProps {
  photos: FlyerPhoto[];
  onChange: (next: FlyerPhoto[]) => void;
  saveStatus: SaveStatus;
}

function normalizeOrder(photos: FlyerPhoto[]): FlyerPhoto[] {
  return photos.map((photo, index) => ({ ...photo, displayOrder: index }));
}

/**
 * Photo management (Phase 2 spec item #3): drag-and-drop + file-input
 * upload, client-side resize/compress via Canvas, drag-to-reorder (desktop)
 * with up/down buttons as a mobile-friendly supplement, cover-photo
 * selection, and delete. Photos are handed to the parent as data URLs —
 * the parent's persistence call (`src/lib/flyer/persistence.ts`) is what
 * decides whether those get uploaded to Supabase Storage or kept as-is for
 * local/mock mode.
 */
export function FlyerPhotoManager({ photos, onChange, saveStatus }: FlyerPhotoManagerProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragIndexRef = React.useRef<number | null>(null);

  const sorted = React.useMemo(
    () => [...photos].sort((a, b) => a.displayOrder - b.displayOrder),
    [photos]
  );

  async function addFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setIsProcessing(true);
    setError(null);
    try {
      const resized = await Promise.all(imageFiles.map((file) => resizeImageFile(file)));
      const nextPhotos: FlyerPhoto[] = resized.map((r, i) => ({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        url: r.dataUrl,
        displayOrder: photos.length + i,
        isCover: photos.length === 0 && i === 0,
      }));
      onChange(normalizeOrder([...photos, ...nextPhotos]));
    } catch {
      setError("Some photos couldn't be processed — try again with a JPEG or PNG.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      void addFiles(e.dataTransfer.files);
    }
  }

  function setCover(id: string) {
    onChange(photos.map((p) => ({ ...p, isCover: p.id === id })));
  }

  function remove(id: string) {
    const remaining = photos.filter((p) => p.id !== id);
    if (remaining.length > 0 && !remaining.some((p) => p.isCover)) {
      remaining[0].isCover = true;
    }
    onChange(normalizeOrder(remaining));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(normalizeOrder(next));
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDropOnTile(index: number) {
    const from = dragIndexRef.current;
    dragIndexRef.current = null;
    if (from === null || from === index) return;
    const next = [...sorted];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    onChange(normalizeOrder(next));
  }

  return (
    <DashboardCard
      title="Photos"
      className="relative"
      contentClassName="mt-4 space-y-4"
    >
      <div className="absolute right-5 top-5">
        <FlyerAutoSaveIndicator status={saveStatus} />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          isDragOver ? "border-gold-400 bg-gold-50 dark:bg-gold-500/10" : "border-border bg-background"
        )}
      >
        <UploadCloud className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {isProcessing ? "Processing photos…" : "Drag photos here, or"}
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="text-sm font-semibold text-navy-700 underline-offset-2 hover:underline dark:text-gold-400"
        >
          browse to upload
        </button>
        <p className="text-xs text-muted-foreground">JPEG or PNG, multiple files supported</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {sorted.length === 0 ? (
        <EmptyState
          icon={UploadCloud}
          title="No photos yet"
          description="Upload listing photos to power the AI copy, template previews, and the exported PDF."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((photo, index) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOnTile(index)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={`Listing photo ${index + 1}`} className="h-full w-full object-cover" />

              {photo.isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-navy-950/85 px-2 py-1 text-[10px] font-semibold text-gold-400">
                  Cover
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-navy-950/90 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-30"
                    aria-label="Move up in order"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === sorted.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-30"
                    aria-label="Move down in order"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCover(photo.id)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                      photo.isCover ? "bg-gold-500 text-navy-950" : "bg-white/15 text-white hover:bg-white/25"
                    )}
                    aria-label="Set as cover photo"
                  >
                    <Star className="h-3.5 w-3.5" fill={photo.isCover ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(photo.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-red-500/80"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
