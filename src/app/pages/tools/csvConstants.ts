/** Shared constants for CsvGraphViewer. */

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export const getContrastTextColor = (hexColor: string): string => {
  if (!hexColor || !HEX_COLOR_RE.test(hexColor)) return '#1e293b';
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#1e293b' : '#f8fafc';
};

export const COLOR_PALETTES: Record<string, string[]> = {
  default: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  cool: ['#2563EB', '#0EA5E9', '#06B6D4', '#14B8A6', '#6366F1', '#8B5CF6'],
  warm: ['#DC2626', '#EA580C', '#D97706', '#CA8A04', '#BE123C', '#9F1239'],
  pastel: ['#FDA4AF', '#FDBA74', '#FDE047', '#86EFAC', '#67E8F9', '#C4B5FD'],
  monochrome: [
    '#334155',
    '#475569',
    '#64748b',
    '#94a3b8',
    '#cbd5e1',
    '#e2e8f0',
  ],
};
