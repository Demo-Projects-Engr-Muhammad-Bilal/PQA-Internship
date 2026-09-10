"use client";

import { useEffect, useState } from "react";

/**
 * Holds a decrypted/base64 image (e.g. a pilot signature) in component
 * state only while the component is mounted, and actively scrubs the
 * string reference on unmount so it isn't retained in memory/dev-tools
 * longer than the review action requires.
 */
export function useEphemeralSecureImage(sourceValue: string | null | undefined) {
  const [value, setValue] = useState<string | null>(sourceValue ?? null);

  useEffect(() => {
    setValue(sourceValue ?? null);
    return () => {
      // Best-effort scrub: overwrite before releasing the reference.
      setValue(null);
    };
  }, [sourceValue]);

  return value;
}
