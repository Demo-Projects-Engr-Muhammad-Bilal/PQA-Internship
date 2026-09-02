/**
 * Formats a value that may be a `Date` instance (e.g. rehydrated from a
 * localStorage draft) or a string (e.g. straight from a native
 * `<input type="datetime-local">` change event) into the
 * `YYYY-MM-DDTHH:mm` shape that datetime-local inputs require as their
 * controlled `value`. Returns "" for null/undefined so the input stays
 * a valid controlled component.
 */
export function toDatetimeLocalValue(value: unknown): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) {
    // Already a partial/invalid string (e.g. mid-typing) — pass through.
    return typeof value === "string" ? value : "";
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
