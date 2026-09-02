"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface StampCaptureProps {
  label?: string;
  onChange: (base64: string) => void;
  value?: string;
}

/**
 * Camera / file-picker input that converts the selected image to a
 * Base64 data-URL and passes it up via `onChange`.
 * Uses `capture="environment"` on mobile to open the rear camera directly.
 */
export default function StampCapture({
  label = "Ship\u2019s Stamp",
  onChange,
  value,
}: StampCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      setError(null);

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">
        {label}
      </span>

      {value ? (
        /* Preview the captured stamp */
        <div className="relative w-full rounded-xl border-2 border-primary/30 bg-gray-50 overflow-hidden">
          <div className="flex items-center gap-3 p-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={value}
                alt="Ship stamp preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
                <CheckCircle2 className="size-4" />
                Stamp captured
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tap the button to replace it.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive h-8 w-8"
              onClick={handleClear}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* Upload / capture button */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-gray-50 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <Camera className="size-8 text-primary/40" />
          <span className="font-medium">Tap to capture or upload stamp</span>
          <span className="text-xs">JPG, PNG, WEBP accepted</span>
        </button>
      )}

      {/* Hidden file input — camera-first on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
