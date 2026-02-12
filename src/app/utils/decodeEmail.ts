/** Decode Base64-encoded email with format validation. */
export function decodeEmail(encoded: string, isEncoded: boolean): string {
  if (!isEncoded) return encoded;
  try {
    const decoded = atob(encoded);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decoded) ? decoded : '';
  } catch {
    return '';
  }
}
