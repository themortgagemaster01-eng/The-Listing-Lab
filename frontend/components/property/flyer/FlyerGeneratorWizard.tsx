"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { TabSegmentedControl, type SegmentOption } from "@/components/property/TabSegmentedControl";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { FlyerAutoSaveIndicator, type SaveStatus } from "@/components/property/flyer/FlyerAutoSaveIndicator";
import { FlyerPropertyForm } from "@/components/property/flyer/FlyerPropertyForm";
import { FlyerPhotoManager } from "@/components/property/flyer/FlyerPhotoManager";
import { FlyerAiWriter, type AiWriterStatus } from "@/components/property/flyer/FlyerAiWriter";
import { FlyerTemplatePicker } from "@/components/property/flyer/FlyerTemplatePicker";
import { FlyerExportPanel } from "@/components/property/flyer/FlyerExportPanel";
import { SavedFlyersList } from "@/components/property/flyer/SavedFlyersList";
import * as persistence from "@/lib/flyer/persistence";
import { seedFormFromProperty, seedPhotosFromProperty, toPropertyAiInput } from "@/lib/flyer/mappers";
import { useDebouncedSave } from "@/lib/hooks/use-debounced-save";
import { resolveFlyerText, type FlyerPhoto, type FlyerRecord, type PropertyFormData } from "@/lib/flyer/types";
import type { FlyerTemplate, FlyerTextContent } from "@/lib/supabase/types";
import type { Property } from "@/types";

const STEPS: SegmentOption<"details" | "photos" | "copy" | "template">[] = [
  { id: "details", label: "Details" },
  { id: "photos", label: "Photos" },
  { id: "copy", label: "AI Copy" },
  { id: "template", label: "Template & Export" },
];

type Step = (typeof STEPS)[number]["id"];
type ViewMode = "list" | "edit";

interface FlyerGeneratorPanelProps {
  property: Property;
}

function newFlyerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `flyer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDraftFlyer(propertyId: string, title: string): FlyerRecord {
  const id = newFlyerId();
  const now = new Date().toISOString();
  return {
    id,
    marketingAssetId: id,
    propertyId,
    title: title || "Untitled Flyer",
    template: "modern",
    aiGeneratedText: null,
    userEditedText: null,
    pdfDataUrl: null,
    pdfUrl: null,
    status: "draft",
    version: 1,
    createdAt: now,
    updatedAt: now,
    history: [],
  };
}

/**
 * Full AI Flyer Generator panel — the whole Phase 2 feature (spec items
 * #1–#7) lives here: a saved-flyers gallery (Marketing Assets → Flyers)
 * that opens into a 4-step wizard (property details → photos → AI writing
 * → template & PDF export). Owns all persistence (auto-save, debounced,
 * always through `src/lib/flyer/persistence.ts` so it behaves identically
 * whether Supabase is configured or not — see that file's header comment).
 *
 * Mounted once per property from `FlyersTab`; property details and photos
 * are shared across every flyer for this property, while AI copy/template/
 * version history are per-flyer (see `src/lib/flyer/types.ts`).
 */
export function FlyerGeneratorWizard({ property }: FlyerGeneratorPanelProps) {
  const propertyId = property.id;
  const [loaded, setLoaded] = React.useState(false);
  const [form, setForm] = React.useState<PropertyFormData>(() => seedFormFromProperty(property));
  const [photos, setPhotos] = React.useState<FlyerPhoto[]>(() => seedPhotosFromProperty(property));
  const [flyers, setFlyers] = React.useState<FlyerRecord[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [activeFlyerId, setActiveFlyerId] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<Step>("details");
  const [aiStatus, setAiStatus] = React.useState<AiWriterStatus>("idle");
  const [aiError, setAiError] = React.useState<string | null>(null);

  const flyersRef = React.useRef(flyers);
  React.useEffect(() => {
    flyersRef.current = flyers;
  }, [flyers]);

  // ---- initial load ----
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedForm, savedPhotos, savedFlyers] = await Promise.all([
        persistence.loadPropertyForm(propertyId),
        persistence.loadPhotos(propertyId),
        persistence.loadFlyers(propertyId),
      ]);
      if (cancelled) return;

      setForm(savedForm ?? seedFormFromProperty(property));
      setPhotos(savedPhotos.length > 0 ? savedPhotos : seedPhotosFromProperty(property));
      setFlyers(savedFlyers);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally only depends on propertyId — re-running on every `property` object identity change would clobber in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const activeFlyer = React.useMemo(
    () => flyers.find((f) => f.id === activeFlyerId) ?? null,
    [flyers, activeFlyerId]
  );

  function updateActiveFlyer(patch: Partial<FlyerRecord>) {
    if (!activeFlyerId) return;
    setFlyers((prev) =>
      prev.map((f) => (f.id === activeFlyerId ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f))
    );
  }

  // ---- auto-save: property form ----
  const formSaveStatus: SaveStatus = useDebouncedSave(
    form,
    (value) => persistence.savePropertyForm(propertyId, value),
    { enabled: loaded }
  );

  // ---- auto-save: photos ----
  const photosSaveStatus: SaveStatus = useDebouncedSave(
    photos,
    async (value) => {
      const resolved = await persistence.savePhotos(propertyId, value);
      setPhotos(resolved);
    },
    { enabled: loaded }
  );

  // ---- auto-save: active flyer (text edits, template choice) ----
  const flyerSaveStatus: SaveStatus = useDebouncedSave(
    activeFlyer,
    async (flyer) => {
      if (!flyer) return;
      await persistence.saveFlyer(propertyId, flyer, flyersRef.current);
    },
    { enabled: loaded && !!activeFlyer, delay: 700 }
  );

  function openFlyer(id: string) {
    const flyer = flyers.find((f) => f.id === id);
    setActiveFlyerId(id);
    setAiStatus(flyer?.aiGeneratedText ? "ready" : "idle");
    setAiError(null);
    setStep(flyer?.aiGeneratedText ? "template" : "copy");
    setViewMode("edit");
  }

  function createNewFlyer() {
    const draft = createDraftFlyer(propertyId, form.address);
    setFlyers((prev) => [draft, ...prev]);
    setActiveFlyerId(draft.id);
    setAiStatus("idle");
    setAiError(null);
    setStep(form.address ? (photos.length > 0 ? "copy" : "photos") : "details");
    setViewMode("edit");
  }

  async function generateCopy(regenerate: boolean) {
    if (!activeFlyerId) return;
    setAiStatus("loading");
    setAiError(null);
    try {
      const res = await fetch("/api/ai/generate-flyer-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, inputs: toPropertyAiInput(form) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "AI generation failed.");
      const result = json.result as FlyerTextContent;

      setFlyers((prev) =>
        prev.map((f) => {
          if (f.id !== activeFlyerId) return f;
          const shouldSnapshot = regenerate && f.aiGeneratedText && f.userEditedText;
          const history = shouldSnapshot
            ? [
                {
                  version: f.version,
                  template: f.template,
                  aiGeneratedText: f.aiGeneratedText as FlyerTextContent,
                  userEditedText: f.userEditedText as FlyerTextContent,
                  pdfDataUrl: f.pdfDataUrl,
                  createdAt: f.updatedAt,
                },
                ...f.history,
              ]
            : f.history;
          return {
            ...f,
            aiGeneratedText: result,
            userEditedText: result,
            version: shouldSnapshot ? f.version + 1 : f.version,
            title: form.address || f.title,
            updatedAt: new Date().toISOString(),
            history,
          };
        })
      );
      setAiStatus("ready");
      setStep("copy");
    } catch (err) {
      setAiStatus("error");
      setAiError(err instanceof Error ? err.message : "Something went wrong generating your copy.");
    }
  }

  function handleTextChange(next: FlyerTextContent) {
    updateActiveFlyer({ userEditedText: next });
  }

  function handleTemplateSelect(template: FlyerTemplate) {
    updateActiveFlyer({ template });
  }

  function handleStartOver() {
    const draft = createDraftFlyer(propertyId, form.address);
    setFlyers((prev) => [draft, ...prev]);
    setActiveFlyerId(draft.id);
    setAiStatus("idle");
    setAiError(null);
    setStep("copy");
  }

  if (!loaded) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-12 w-full rounded-2xl" />
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (viewMode === "list" || !activeFlyer) {
    return (
      <SavedFlyersList
        flyers={flyers}
        photos={photos}
        activeFlyerId={activeFlyerId}
        onOpen={openFlyer}
        onNew={createNewFlyer}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Flyers
        </button>
        <FlyerAutoSaveIndicator status={flyerSaveStatus} />
      </div>

      <TabSegmentedControl options={STEPS} value={step} onChange={setStep} />

      {step === "details" && <FlyerPropertyForm form={form} onChange={setForm} saveStatus={formSaveStatus} />}
      {step === "photos" && <FlyerPhotoManager photos={photos} onChange={setPhotos} saveStatus={photosSaveStatus} />}
      {step === "copy" && (
        <FlyerAiWriter
          status={aiStatus}
          text={resolveFlyerText(activeFlyer)}
          errorMessage={aiError}
          onGenerate={() => generateCopy(Boolean(activeFlyer.aiGeneratedText))}
          onChange={handleTextChange}
        />
      )}
      {step === "template" && (
        <div className="space-y-6">
          <FlyerTemplatePicker
            selected={activeFlyer.template}
            onSelect={handleTemplateSelect}
            form={form}
            photos={photos}
            text={resolveFlyerText(activeFlyer)}
          />
          <FlyerExportPanel form={form} photos={photos} flyer={activeFlyer} onStartOver={handleStartOver} />
        </div>
      )}
    </div>
  );
}
