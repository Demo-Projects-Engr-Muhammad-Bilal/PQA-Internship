"use client";

import { useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "../ui/button";
import { Eraser } from "lucide-react";

export interface SignaturePadHandle {
  /** Returns Base64 PNG data-URL, or empty string if the pad is blank. */
  getDataURL: () => string;
  /** True when no strokes have been drawn. */
  isEmpty: () => boolean;
  /** Clears all strokes. */
  clear: () => void;
}

interface SignaturePadProps {
  label?: string;
}

/**
 * Responsive wrapper around react-signature-canvas.
 * Expose ref methods via SignaturePadHandle so parent components
 * can read the Base64 PNG without managing extra state.
 */
const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ label = "Signature" }, ref) => {
    const canvasRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      getDataURL: () => {
        if (!canvasRef.current || canvasRef.current.isEmpty()) return "";
        return canvasRef.current.toDataURL("image/png");
      },
      isEmpty: () => canvasRef.current?.isEmpty() ?? true,
      clear: () => canvasRef.current?.clear(),
    }));

    const handleClear = useCallback(() => {
      canvasRef.current?.clear();
    }, []);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {label}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-destructive"
            onClick={handleClear}
          >
            <Eraser className="mr-1 size-3" />
            Clear
          </Button>
        </div>

        {/* Canvas wrapper — fills available width, fixed height */}
        <div className="relative w-full overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-gray-50 hover:border-primary/60 transition-colors">
          <SignatureCanvas
            ref={canvasRef}
            penColor="#0f2a4a"
            canvasProps={{
              className: "w-full h-32 touch-none",
              style: { width: "100%", height: "128px" },
            }}
          />
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground/50 select-none">
            Draw signature above
          </p>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";
export { SignaturePad };
