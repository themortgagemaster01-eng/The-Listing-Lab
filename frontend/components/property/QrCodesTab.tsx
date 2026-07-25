import type { ReactNode } from "react";
import { Download, QrCode as QrCodeIcon } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { ComingSoonButton } from "@/components/property/ComingSoonButton";
import type { Property } from "@/types";

function slugify(address: string, cityStateZip: string) {
  const city = cityStateZip.split(",")[0] ?? "";
  return `${address}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Deterministic pseudo-random bit for cell (r, c), seeded by a string. Doesn't scan — visual only. */
function cellIsDark(seed: string, row: number, col: number) {
  let hash = 0;
  const str = `${seed}-${row}-${col}`;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % 5 < 2;
}

const GRID_SIZE = 21;
const FINDER_SIZE = 7;

function isInFinder(row: number, col: number) {
  const corners = [
    [0, 0],
    [0, GRID_SIZE - FINDER_SIZE],
    [GRID_SIZE - FINDER_SIZE, 0],
  ];
  return corners.some(([r, c]) => row >= r && row < r + FINDER_SIZE && col >= c && col < c + FINDER_SIZE);
}

function isFinderDark(row: number, col: number) {
  const corners = [
    [0, 0],
    [0, GRID_SIZE - FINDER_SIZE],
    [GRID_SIZE - FINDER_SIZE, 0],
  ];
  for (const [r0, c0] of corners) {
    if (row >= r0 && row < r0 + FINDER_SIZE && col >= c0 && col < c0 + FINDER_SIZE) {
      const localR = row - r0;
      const localC = col - c0;
      const onOuterRing = localR === 0 || localR === 6 || localC === 0 || localC === 6;
      const onInnerSquare = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
      return onOuterRing || onInnerSquare;
    }
  }
  return false;
}

/** Purely decorative QR-style SVG pattern — not scannable, but visually convincing. */
function MockQrCode({ seed }: { seed: string }) {
  const cells: ReactNode[] = [];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const dark = isInFinder(row, col) ? isFinderDark(row, col) : cellIsDark(seed, row, col);
      if (dark) {
        cells.push(<rect key={`${row}-${col}`} x={col} y={row} width={1} height={1} fill="currentColor" />);
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
      className="h-full w-full text-navy-950 dark:text-white"
      shapeRendering="crispEdges"
    >
      <rect x={0} y={0} width={GRID_SIZE} height={GRID_SIZE} fill="white" className="dark:fill-navy-900" />
      {cells}
    </svg>
  );
}

interface QrCodesTabProps {
  property: Property;
}

export function QrCodesTab({ property }: QrCodesTabProps) {
  const url = `listinglab.io/${slugify(property.address, property.cityStateZip)}`;

  return (
    <div className="space-y-6">
      <DashboardCard title="Property QR Code">
        <div className="flex flex-col items-center gap-5 py-4 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
          <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-soft">
            <MockQrCode seed={property.id} />
          </div>

          <div className="max-w-xs text-center sm:text-left">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400 sm:mx-0">
              <QrCodeIcon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">Links to your property website</p>
            <p className="mt-1 text-sm text-muted-foreground">https://{url}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Print this on yard signs, flyers, or open house handouts so buyers can scan straight
              through to the full property website.
            </p>
            <div className="mt-4 flex justify-center sm:justify-start">
              <ComingSoonButton variant="gold" icon={Download} message="Download is coming soon">
                Download QR Code
              </ComingSoonButton>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
