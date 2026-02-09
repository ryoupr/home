declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { PptxGenJS?: new () => any; }
}

export const PPTX_CDN_URL = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
export const PPTX_SCRIPT_ID = "pptxgenjs-cdn";
export const PPTX_SHAPE_OFFSET_X = -0.02;

export const COLORS = [
  { name: 'Blue', bg: 'bg-blue-500', hex: '3B82F6' },
  { name: 'Green', bg: 'bg-emerald-500', hex: '10B981' },
  { name: 'Red', bg: 'bg-rose-500', hex: 'F43F5E' },
  { name: 'Amber', bg: 'bg-amber-500', hex: 'F59E0B' },
  { name: 'Purple', bg: 'bg-purple-500', hex: 'A855F7' },
  { name: 'Indigo', bg: 'bg-indigo-500', hex: '6366F1' },
  { name: 'Cyan', bg: 'bg-cyan-500', hex: '06B6D4' },
  { name: 'Gray', bg: 'bg-slate-500', hex: '64748B' },
];

export const VIEW_MODES = [
  { id: 'day', label: '日次' },
  { id: 'week', label: '週次' },
  { id: 'month', label: '月次' },
  { id: 'year', label: '年次' },
  { id: 'fy', label: '年度' },
];

export const MODE_SHIFT: Record<string, number> = { day: 7, week: 28, month: 90, year: 365, fy: 365 };
export const SPECIAL_COL_WIDTH = 80;
export const TASK_HEIGHT = 32;
export const TASK_GAP = 8;

export interface Task {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  category: string;
  startType: 'date' | 'special';
  endType: 'date' | 'special';
}

export interface LaneTask extends Task {
  laneIndex: number;
  xStart: number;
  width: number;
}
