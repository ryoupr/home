import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Trash2, Settings, Download, Upload, FileJson, Presentation,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, GripVertical,
  Edit2, X, AlertCircle, Loader2, Check, CalendarDays, PlusCircle
} from 'lucide-react';

// --- PptxGenJS type declaration ---
declare global {
  interface Window { PptxGenJS?: new () => any; }
}

// --- Constants & Helpers ---

const PPTX_CDN_URL = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
const PPTX_SCRIPT_ID = "pptxgenjs-cdn";
/** テーブルセルとシェブロン図形の水平位置補正値（インチ） */
const PPTX_SHAPE_OFFSET_X = -0.02;

const COLORS = [
  { name: 'Blue', bg: 'bg-blue-500', hex: '3B82F6' },
  { name: 'Green', bg: 'bg-emerald-500', hex: '10B981' },
  { name: 'Red', bg: 'bg-rose-500', hex: 'F43F5E' },
  { name: 'Amber', bg: 'bg-amber-500', hex: 'F59E0B' },
  { name: 'Purple', bg: 'bg-purple-500', hex: 'A855F7' },
  { name: 'Indigo', bg: 'bg-indigo-500', hex: '6366F1' },
  { name: 'Cyan', bg: 'bg-cyan-500', hex: '06B6D4' },
  { name: 'Gray', bg: 'bg-slate-500', hex: '64748B' },
];

const VIEW_MODES = [
  { id: 'day', label: '日次' },
  { id: 'week', label: '週次' },
  { id: 'month', label: '月次' },
  { id: 'year', label: '年次' },
  { id: 'fy', label: '年度' },
];

const MODE_SHIFT: Record<string, number> = {
  day: 7, week: 28, month: 90, year: 365, fy: 365,
};

const SPECIAL_COL_WIDTH = 80;
const TASK_HEIGHT = 32;
const TASK_GAP = 8;

interface Task {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  category: string;
  startType: 'date' | 'special';
  endType: 'date' | 'special';
}

interface LaneTask extends Task {
  laneIndex: number;
  xStart: number;
  width: number;
}

const normalizeDate = (date: string | Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseDateLocal = (dateInput?: string | null): Date => {
  if (!dateInput) return new Date();
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getFiscalInfo = (date: Date) => {
  const month = date.getMonth();
  const fy = month < 3 ? date.getFullYear() - 1 : date.getFullYear();
  return { fy, label: `${fy}年度` };
};

// --- Japanese Holiday Logic ---

const getJapaneseHolidays = (year: number): Record<string, string> => {
  const holidays: Record<string, string> = {};
  const add = (date: Date, name: string) => { holidays[formatDate(date)] = name; };
  add(new Date(year, 0, 1), "元日");
  add(new Date(year, 1, 11), "建国記念の日");
  add(new Date(year, 1, 23), "天皇誕生日");
  add(new Date(year, 3, 29), "昭和の日");
  add(new Date(year, 4, 3), "憲法記念日");
  add(new Date(year, 4, 4), "みどりの日");
  add(new Date(year, 4, 5), "こどもの日");
  add(new Date(year, 7, 11), "山の日");
  add(new Date(year, 10, 3), "文化の日");
  add(new Date(year, 10, 23), "勤労感謝の日");
  const getHappyMonday = (month: number, week: number) => {
    const first = new Date(year, month, 1);
    const day = first.getDay();
    const offset = (1 - day + 7) % 7;
    return new Date(year, month, 1 + offset + (week - 1) * 7);
  };
  add(getHappyMonday(0, 2), "成人の日");
  add(getHappyMonday(6, 3), "海の日");
  add(getHappyMonday(8, 3), "敬老の日");
  add(getHappyMonday(9, 2), "スポーツの日");
  const shunbun = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  add(new Date(year, 2, shunbun), "春分の日");
  const shubun = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  add(new Date(year, 8, shubun), "秋分の日");
  Object.keys(holidays).forEach(dateStr => {
    const d = new Date(dateStr);
    if (d.getDay() === 0) {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      while (holidays[formatDate(next)]) next.setDate(next.getDate() + 1);
      add(next, "振替休日");
    }
  });
  const sortedDates = Object.keys(holidays).sort();
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const d1 = new Date(sortedDates[i]);
    const d2 = new Date(sortedDates[i + 1]);
    const diff = (d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000);
    if (diff === 2) {
      const mid = new Date(d1);
      mid.setDate(mid.getDate() + 1);
      if (mid.getDay() !== 0) add(mid, "国民の休日");
    }
  }
  return holidays;
};

// --- Main Component ---

export function YabaneSchedulePage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: '要件定義', start: '2026-04-05', end: '2026-04-15', color: 'bg-blue-500', category: '設計', startType: 'date', endType: 'date' },
    { id: '2', title: '基本設計', start: '2026-04-12', end: '2026-04-25', color: 'bg-emerald-500', category: '設計', startType: 'date', endType: 'date' },
    { id: '3', title: '全社展開', start: 'left-0', end: '2026-06-30', color: 'bg-purple-500', category: '開発', startType: 'special', endType: 'date' },
  ]);

  const [categories, setCategories] = useState(['設計', '開発', 'テスト']);
  const [viewStart, setViewStart] = useState('2026-04-01');
  const [viewEnd, setViewEnd] = useState('2027-03-31');
  const [viewMode, setViewMode] = useState('month');
  const [unitWidth, setUnitWidth] = useState(80);
  const [leftCols, setLeftCols] = useState(['前期']);
  const [rightCols, setRightCols] = useState(['来期']);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryConfirmDelete, setCategoryConfirmDelete] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [pptxReady, setPptxReady] = useState(() => !!window.PptxGenJS);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [useJapaneseHolidays, setUseJapaneseHolidays] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const rangePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rangePickerRef.current && !rangePickerRef.current.contains(event.target as Node)) setShowRangePicker(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (message) { const timer = setTimeout(() => setMessage(null), 3000); return () => clearTimeout(timer); }
  }, [message]);

  const holidays = useMemo(() => {
    if (!useJapaneseHolidays) return {};
    const startYear = new Date(viewStart).getFullYear();
    return { ...getJapaneseHolidays(startYear - 1), ...getJapaneseHolidays(startYear), ...getJapaneseHolidays(startYear + 1) };
  }, [viewStart, useJapaneseHolidays]);

  useEffect(() => {
    if (window.PptxGenJS) { setPptxReady(true); return; }
    if (document.getElementById(PPTX_SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = PPTX_SCRIPT_ID;
    script.src = PPTX_CDN_URL;
    script.async = true;
    script.onload = () => setPptxReady(true);
    script.onerror = () => setPptxReady(false);
    document.body.appendChild(script);
  }, []);

  const timelineUnits = useMemo(() => {
    const units: Date[] = [];
    const current = normalizeDate(viewStart);
    const end = normalizeDate(viewEnd);
    if (current > end) return [current];
    if (viewMode === 'month') current.setDate(1);
    if (viewMode === 'year' || viewMode === 'fy') current.setMonth(0, 1);
    let count = 0;
    while (current <= end && count < 1000) {
      units.push(new Date(current));
      if (viewMode === 'day') current.setDate(current.getDate() + 1);
      else if (viewMode === 'week') current.setDate(current.getDate() + 7);
      else if (viewMode === 'month') current.setMonth(current.getMonth() + 1);
      else current.setFullYear(current.getFullYear() + 1);
      count++;
    }
    return units;
  }, [viewStart, viewEnd, viewMode]);

  const totalTimelineWidth = useMemo(() =>
    (leftCols.length + rightCols.length) * SPECIAL_COL_WIDTH + timelineUnits.length * unitWidth,
  [leftCols, rightCols, timelineUnits, unitWidth]);

  const getXForLocation = (type: string, val: string, isEndDate = false): number => {
    if (type === 'special') {
      if (!val || typeof val !== 'string') return 0;
      const parts = val.split('-');
      if (parts.length < 2) return 0;
      const side = parts[0];
      const idx = parseInt(parts[1], 10);
      if (isNaN(idx)) return 0;
      if (side === 'left') return idx * SPECIAL_COL_WIDTH + (isEndDate ? SPECIAL_COL_WIDTH : 0);
      return leftCols.length * SPECIAL_COL_WIDTH + timelineUnits.length * unitWidth + idx * SPECIAL_COL_WIDTH + (isEndDate ? SPECIAL_COL_WIDTH : 0);
    }
    const offsetLeft = leftCols.length * SPECIAL_COL_WIDTH;
    const startOfTimeline = timelineUnits[0]?.getTime() ?? 0;
    const targetDate = parseDateLocal(val);
    if (isEndDate) targetDate.setDate(targetDate.getDate() + 1);
    const targetTime = targetDate.getTime();
    if (targetTime < startOfTimeline) return offsetLeft;
    for (let i = 0; i < timelineUnits.length; i++) {
      const unitStart = timelineUnits[i];
      const unitEnd = new Date(unitStart);
      if (viewMode === 'day') unitEnd.setDate(unitEnd.getDate() + 1);
      else if (viewMode === 'week') unitEnd.setDate(unitEnd.getDate() + 7);
      else if (viewMode === 'month') unitEnd.setMonth(unitEnd.getMonth() + 1);
      else unitEnd.setFullYear(unitEnd.getFullYear() + 1);
      if (targetTime >= unitStart.getTime() && targetTime < unitEnd.getTime()) {
        const progress = (targetTime - unitStart.getTime()) / (unitEnd.getTime() - unitStart.getTime());
        return offsetLeft + i * unitWidth + progress * unitWidth;
      }
    }
    return offsetLeft + timelineUnits.length * unitWidth;
  };

  const getTasksInLanes = (categoryTasks: Task[]): LaneTask[] => {
    const lanes: number[] = [];
    const calendarEndX = leftCols.length * SPECIAL_COL_WIDTH + timelineUnits.length * unitWidth;
    const timelineEndX = calendarEndX + rightCols.length * SPECIAL_COL_WIDTH;
    return categoryTasks.map(task => {
      let xStart = getXForLocation(task.startType || 'date', task.start, false);
      let xEnd = getXForLocation(task.endType || 'date', task.end, true);
      if (task.endType === 'date' || !task.endType) { if (xEnd > calendarEndX) xEnd = calendarEndX; }
      if (xEnd > timelineEndX) xEnd = timelineEndX;
      if (xStart < 0) xStart = 0;
      let width = xEnd - xStart;
      if (width < 24) width = 24;
      let laneIndex = 0;
      while (lanes[laneIndex] !== undefined && lanes[laneIndex] > xStart) laneIndex++;
      lanes[laneIndex] = xEnd + 10;
      return { ...task, laneIndex, xStart, width };
    });
  };

  const addTask = (category: string) => {
    const newTask: Task = { id: Math.random().toString(36).substr(2, 9), title: '新規タスク', start: formatDate(new Date(viewStart)), end: formatDate(new Date(viewStart)), startType: 'date', endType: 'date', color: 'bg-blue-500', category: category || categories[0] };
    setTasks([...tasks, newTask]);
    setEditingTask(newTask);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingTask(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  };

  const deleteTask = (id: string) => { setTasks(tasks.filter(t => t.id !== id)); setEditingTask(null); };

  const handleDragStart = (e: React.DragEvent, taskId: string) => { setDragTaskId(taskId); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (!dragTaskId || dragTaskId === targetTaskId) return;
    const si = tasks.findIndex(t => t.id === dragTaskId);
    const ti = tasks.findIndex(t => t.id === targetTaskId);
    if (si === -1 || ti === -1 || tasks[si].category !== tasks[ti].category) return;
    const newTasks = [...tasks]; const [moved] = newTasks.splice(si, 1); newTasks.splice(ti, 0, moved);
    setTasks(newTasks); setDragTaskId(null);
  };
  const handleDragEnd = () => { setDragTaskId(null); };

  const attemptDeleteCategory = (catName: string) => {
    if (tasks.some(t => t.category === catName)) setCategoryConfirmDelete(catName);
    else setCategories(categories.filter(c => c !== catName));
  };
  const confirmDeleteCategory = () => {
    setTasks(tasks.filter(t => t.category !== categoryConfirmDelete));
    setCategories(categories.filter(c => c !== categoryConfirmDelete));
    setCategoryConfirmDelete(null);
  };
  const handleAddCategory = () => {
    if (newCategoryName.trim()) { setCategories([...categories, newCategoryName.trim()]); setNewCategoryName(''); setShowAddCategoryModal(false); }
  };

  const shiftView = (dir: number) => {
    const s = parseDateLocal(viewStart); const e = parseDateLocal(viewEnd);
    const amount = dir * (MODE_SHIFT[viewMode] || 30);
    s.setDate(s.getDate() + amount); e.setDate(e.getDate() + amount);
    setViewStart(formatDate(s)); setViewEnd(formatDate(e));
  };

  const handleExportJSON = () => {
    const data = { version: "1.9", tasks, categories, viewStart, viewEnd, viewMode, unitWidth, leftCols, rightCols };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `yabane-${formatDate(new Date())}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setTasks(data.tasks); setCategories(data.categories);
        if (data.viewStart) setViewStart(data.viewStart);
        if (data.viewEnd) setViewEnd(data.viewEnd);
        if (data.viewMode) setViewMode(data.viewMode);
        setMessage({ type: 'success', text: 'データを復元しました' });
      } catch { setMessage({ type: 'error', text: '読込失敗' }); }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportPPTX = useCallback(async () => {
    if (!pptxReady || !window.PptxGenJS) { setMessage({ type: 'error', text: 'ライブラリ読込中... 再試行してください' }); return; }
    setIsExporting(true);
    try {
      const pptx = new window.PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      const slide = pptx.addSlide();
      slide.addText("矢羽スケジュール", { x: 0.5, y: 0.2, w: 9, h: 0.5, fontSize: 24, bold: true, color: '333333' });
      const START_X = 0.5, START_Y = 1.0, SLIDE_WIDTH = 13.33;
      const CATEGORY_COL_WIDTH = 1.5;
      const TIMELINE_WIDTH = SLIDE_WIDTH - CATEGORY_COL_WIDTH - START_X * 2;
      if (totalTimelineWidth === 0) throw new Error("タイムライン幅が0です");
      const pxToInch = TIMELINE_WIDTH / totalTimelineWidth;
      const leftColWidthInch = SPECIAL_COL_WIDTH * pxToInch;
      const unitWidthInch = unitWidth * pxToInch;
      const rightColWidthInch = SPECIAL_COL_WIDTH * pxToInch;

      // Fix #6: タスクが存在するカテゴリのみ出力
      const activeCategories = categories.filter(cat => tasks.some(t => t.category === cat));
      if (activeCategories.length === 0) { setMessage({ type: 'error', text: '出力するタスクがありません' }); return; }

      const colWidths = [CATEGORY_COL_WIDTH, ...Array(leftCols.length).fill(leftColWidthInch), ...Array(timelineUnits.length).fill(unitWidthInch), ...Array(rightCols.length).fill(rightColWidthInch)];

      // Fix #5: 日次モードで列数が多すぎる場合に警告
      if (viewMode === 'day' && timelineUnits.length > 90) {
        setMessage({ type: 'error', text: '日次モードの表示範囲が広すぎます（90日以内に絞ってください）' }); return;
      }

      const HEADER_HEIGHT = 0.6, MIN_ROW_HEIGHT = 0.7, TASK_V_STEP = 0.35, TASK_SHAPE_H = 0.25;
      const categoryHeights = activeCategories.map(category => {
        const laneTasks = getTasksInLanes(tasks.filter(t => t.category === category));
        const maxLane = Math.max(-1, ...laneTasks.map(t => t.laneIndex));
        return Math.max(MIN_ROW_HEIGHT, (maxLane + 1) * TASK_V_STEP + 0.3);
      });
      const tableRowHeights = [HEADER_HEIGHT, ...categoryHeights];
      const headerOptions = { fill: 'F1F5F9', bold: true, align: 'center' as const, valign: 'middle' as const, border: { pt: 1, color: 'CBD5E1' }, fontSize: 10, margin: 0 };
      const headerRow: any[] = [{ text: "工程区分", options: headerOptions }];
      leftCols.forEach(c => headerRow.push({ text: c, options: { ...headerOptions, fill: 'E2E8F0' } }));
      timelineUnits.forEach(date => {
        const isHolidayMode = viewMode === 'day';
        const isHoliday = isHolidayMode && useJapaneseHolidays && holidays[formatDate(date)];
        const isSun = isHolidayMode && date.getDay() === 0;
        let label = "";
        if (viewMode === 'day') label = `${date.getMonth() + 1}/${date.getDate()}`;
        else if (viewMode === 'week') label = `W${Math.ceil(date.getDate() / 7)}`;
        else if (viewMode === 'month') label = `${date.getFullYear()}年\n${date.getMonth() + 1}月`;
        else if (viewMode === 'year') label = `${date.getFullYear()}年`;
        else if (viewMode === 'fy') label = getFiscalInfo(date).label;
        headerRow.push({ text: label, options: { ...headerOptions, fill: (isHoliday || isSun) ? 'FFE4E6' : 'F1F5F9' } });
      });
      rightCols.forEach(c => headerRow.push({ text: c, options: { ...headerOptions, fill: 'E2E8F0' } }));
      const tableRows: any[][] = [headerRow];
      activeCategories.forEach(cat => {
        const row: any[] = [{ text: cat, options: { bold: true, valign: 'middle', align: 'center', border: { pt: 1, color: 'CBD5E1' }, margin: 0 } }];
        for (let i = 0; i < leftCols.length + timelineUnits.length + rightCols.length; i++) row.push({ text: "", options: { border: { pt: 1, color: 'F1F5F9' }, margin: 0 } });
        tableRows.push(row);
      });
      const totalTableWidthInch = colWidths.reduce((sum, w) => sum + w, 0);
      slide.addTable(tableRows, { x: START_X, y: START_Y, w: totalTableWidthInch, colW: colWidths, rowH: tableRowHeights, autoPage: false });
      activeCategories.forEach((category, catIdx) => {
        const laneTasks = getTasksInLanes(tasks.filter(t => t.category === category));
        let currentCatY = START_Y + HEADER_HEIGHT;
        for (let i = 0; i < catIdx; i++) currentCatY += categoryHeights[i];
        laneTasks.forEach(task => {
          let shapeX_px = task.xStart, shapeW_px = task.width;
          if (shapeX_px < 0) { shapeW_px += shapeX_px; shapeX_px = 0; }
          if (shapeX_px + shapeW_px > totalTimelineWidth) shapeW_px = totalTimelineWidth - shapeX_px;
          const shapeX = START_X + CATEGORY_COL_WIDTH + shapeX_px * pxToInch + PPTX_SHAPE_OFFSET_X;
          const shapeW = shapeW_px * pxToInch;
          const shapeY = currentCatY + 0.15 + task.laneIndex * TASK_V_STEP;
          if (shapeW > 0) {
            const colorObj = COLORS.find(c => c.bg === task.color) || COLORS[0];
            slide.addShape(pptx.ShapeType.chevron, { x: shapeX, y: shapeY, w: shapeW, h: TASK_SHAPE_H, fill: { color: colorObj.hex }, line: { color: 'FFFFFF', width: 1 } });
            slide.addText(task.title, { x: shapeX, y: shapeY, w: shapeW, h: TASK_SHAPE_H, fontSize: 8, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });
          }
        });
      });
      await pptx.writeFile({ fileName: `yabane-schedule-${formatDate(new Date())}.pptx` });
      setMessage({ type: 'success', text: 'PPTX出力完了' });
    } catch (err: any) { setMessage({ type: 'error', text: `PPTX出力エラー: ${err.message}` }); } finally { setIsExporting(false); }
  }, [pptxReady, categories, tasks, totalTimelineWidth, unitWidth, leftCols, rightCols, timelineUnits, viewMode, useJapaneseHolidays, holidays]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {message && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${message.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'} text-white`}>
          {message.type === 'error' ? <AlertCircle size={18}/> : <Check size={18}/>}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm z-30">
        <div className="flex items-center space-x-4">
          <Link to="/tools" className="text-indigo-600 hover:text-indigo-700 text-xs font-bold whitespace-nowrap">← 戻る</Link>
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><CalendarIcon size={20} /></div>
          <h1 className="text-lg font-bold tracking-tight hidden lg:block text-slate-700">矢羽スケジュール</h1>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {VIEW_MODES.map(mode => (
              <button key={mode.id} onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === mode.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{mode.label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative" ref={rangePickerRef}>
            <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
              <button onClick={() => shiftView(-1)} className="p-1.5 hover:bg-slate-50 border-r border-slate-200"><ChevronLeft size={16} /></button>
              <button onClick={() => setShowRangePicker(!showRangePicker)} className="px-3 py-1.5 text-xs font-bold flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                <CalendarDays size={14} className="text-indigo-500" />
                <span>{viewStart.replace(/-/g, '/')} 〜 {viewEnd.replace(/-/g, '/')}</span>
              </button>
              <button onClick={() => shiftView(1)} className="p-1.5 hover:bg-slate-50 border-l border-slate-200"><ChevronRight size={16} /></button>
            </div>
            {showRangePicker && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 font-bold text-sm">表示範囲設定<button onClick={() => setShowRangePicker(false)}><X size={16}/></button></div>
                <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase">開始日</label><input type="date" value={viewStart} onChange={(e) => setViewStart(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase">終了日</label><input type="date" value={viewEnd} onChange={(e) => setViewEnd(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <button onClick={() => setShowRangePicker(false)} className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">適用</button>
              </div>
            )}
          </div>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <div className="flex items-center space-x-1">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-md text-slate-500" title="JSON読込"><Upload size={18} /></button>
            <input type="file" ref={fileInputRef} onChange={handleImportJSON} className="hidden" accept=".json" />
            <button onClick={handleExportJSON} className="p-2 hover:bg-slate-100 rounded-md text-slate-500" title="JSON保存"><FileJson size={18} /></button>
            <button onClick={handleExportPPTX} disabled={isExporting || !pptxReady} className="p-2 hover:bg-slate-100 rounded-md text-indigo-600 disabled:opacity-50" title={pptxReady ? "PowerPoint出力" : "ライブラリ読込中..."}>{isExporting ? <Loader2 size={18} className="animate-spin" /> : <Presentation size={18} />}</button>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-slate-100 rounded-md text-slate-500" title="設定"><Settings size={18} /></button>
          <button onClick={() => window.print()} className="bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-xs font-bold flex items-center space-x-1 shadow-sm"><Download size={14} /><span>印刷</span></button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-auto scrollbar-thin" ref={timelineRef}>
          <div className="sticky top-0 z-20 flex bg-white border-b border-slate-200 min-w-full w-max">
            <div className="w-40 flex-shrink-0 border-r border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">工程区分</div>
            <div className="flex items-stretch" style={{ width: `${totalTimelineWidth}px` }}>
              {leftCols.map((c, i) => (<div key={`l-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{c}</div>))}
              {timelineUnits.map((date, i) => {
                const dateStr = formatDate(date); const isHolidayMode = viewMode === 'day';
                const holidayName = (isHolidayMode && useJapaneseHolidays) ? holidays[dateStr] : null;
                const isSun = isHolidayMode && date.getDay() === 0;
                let mainLabel = "", subLabel = "";
                if (viewMode === 'day') { mainLabel = date.getDate() === 1 || i === 0 ? `${date.getMonth() + 1}月` : ""; subLabel = date.getDate().toString(); }
                else if (viewMode === 'week') { mainLabel = `${date.getMonth() + 1}月`; subLabel = `W${Math.ceil(date.getDate() / 7)}`; }
                else if (viewMode === 'month') { mainLabel = `${date.getFullYear()}年`; subLabel = `${date.getMonth() + 1}月`; }
                else if (viewMode === 'year') { subLabel = `${date.getFullYear()}年`; }
                else if (viewMode === 'fy') { subLabel = getFiscalInfo(date).label; }
                return (
                  <div key={i} style={{ width: `${unitWidth}px` }} className={`flex-shrink-0 flex flex-col items-center justify-center py-2 border-r border-slate-100 relative ${(holidayName || isSun) ? 'bg-rose-50' : ''}`}>
                    {mainLabel && <span className="absolute top-1 text-[9px] font-bold text-indigo-500 whitespace-nowrap">{mainLabel}</span>}
                    <span className={`text-xs font-bold pt-2 ${(holidayName || isSun) ? 'text-rose-600' : 'text-slate-600'}`}>{subLabel}</span>
                  </div>
                );
              })}
              {rightCols.map((c, i) => (<div key={`r-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{c}</div>))}
            </div>
          </div>

          <div className="flex-1 min-w-full w-max">
            {categories.map((category) => {
              const laneTasks = getTasksInLanes(tasks.filter(t => t.category === category));
              const maxLane = Math.max(-1, ...laneTasks.map(t => t.laneIndex));
              const swimlaneHeight = Math.max(70, (maxLane + 1) * (TASK_HEIGHT + TASK_GAP) + 12);
              return (
                <div key={category} className="flex border-b border-slate-100 group/row" style={{ height: `${swimlaneHeight}px` }}>
                  <div className="w-40 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10 flex items-center px-4 relative group/cat">
                    <span className="text-sm font-bold text-slate-600 truncate mr-10">{category}</span>
                    <div className="absolute right-1 flex items-center space-x-0.5 opacity-0 group-hover/cat:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm pl-1">
                      <button onClick={() => addTask(category)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"><Plus size={14} /></button>
                      <button onClick={() => attemptDeleteCategory(category)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex relative items-stretch" style={{ width: `${totalTimelineWidth}px` }}>
                    <div className="absolute inset-0 flex items-stretch pointer-events-none">
                      {leftCols.map((_, i) => <div key={`lg-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30" />)}
                      {timelineUnits.map((_, i) => <div key={i} style={{ width: `${unitWidth}px` }} className="flex-shrink-0 border-r border-slate-100/50" />)}
                      {rightCols.map((_, i) => <div key={`rg-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30" />)}
                    </div>
                    <div className="relative w-full py-4 overflow-hidden">
                      {laneTasks.map((task) => {
                        const top = task.laneIndex * (TASK_HEIGHT + TASK_GAP);
                        return (
                          <div key={task.id} style={{ left: `${task.xStart + 5}px`, width: `${task.width - 10}px`, top: `${top}px`, height: `${TASK_HEIGHT}px`, opacity: dragTaskId === task.id ? 0.5 : 1 }}
                            className="absolute transition-all hover:z-10 flex items-center justify-center cursor-move"
                            draggable="true" onDragStart={(e) => handleDragStart(e, task.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, task.id)} onDragEnd={handleDragEnd} onClick={() => setEditingTask(task)}>
                            <div className={`absolute inset-0 ${task.color} opacity-90 shadow-sm ${editingTask?.id === task.id ? 'ring-2 ring-indigo-400 ring-offset-1' : ''} group`}
                              style={{ clipPath: 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)' }}>
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 text-white"><GripVertical size={12} /></div>
                            </div>
                            <span className="relative z-10 text-[9px] font-bold text-white px-6 truncate pointer-events-none drop-shadow-sm w-full text-center">{task.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex border-b border-slate-100 min-h-[48px] bg-slate-50/30">
              <div className="w-40 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10 flex items-center px-4">
                <button onClick={() => setShowAddCategoryModal(true)} className="flex items-center space-x-2 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors"><Plus size={14} /><span>区分追加</span></button>
              </div>
              <div className="flex relative items-stretch" style={{ width: `${totalTimelineWidth}px` }}>
                <div className="absolute inset-0 flex items-stretch pointer-events-none">
                  {leftCols.map((_, i) => <div key={`lg-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30" />)}
                  {timelineUnits.map((_, i) => <div key={i} style={{ width: `${unitWidth}px` }} className="flex-shrink-0 border-r border-slate-100/50" />)}
                  {rightCols.map((_, i) => <div key={`rg-${i}`} style={{ width: `${SPECIAL_COL_WIDTH}px` }} className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30" />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {editingTask && (
          <div className="w-72 bg-white border-l border-slate-200 shadow-xl z-30 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 text-slate-700 font-bold text-sm"><div className="flex items-center space-x-2"><Edit2 size={14}/><span>タスク詳細</span></div><button onClick={() => setEditingTask(null)}><X size={18}/></button></div>
            <div className="p-4 space-y-5 overflow-y-auto">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">タスク名</label><input type="text" value={editingTask.title} onChange={(e) => updateTask(editingTask.id, { title: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">開始地点</label>
                <div className="flex rounded-md border border-slate-200 overflow-hidden">
                  <button onClick={() => updateTask(editingTask.id, { startType: 'special', start: 'left-0' })} className={`flex-1 py-1 text-[10px] font-bold ${editingTask.startType === 'special' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>固定列</button>
                  <button onClick={() => updateTask(editingTask.id, { startType: 'date', start: formatDate(new Date(viewStart)) })} className={`flex-1 py-1 text-[10px] font-bold ${editingTask.startType === 'date' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>カレンダー</button>
                </div>
                {editingTask.startType === 'special' ? (
                  <select value={editingTask.start} onChange={(e) => updateTask(editingTask.id, { start: e.target.value })} className="w-full p-1.5 border rounded text-xs">
                    {leftCols.map((c, i) => <option key={`sl-${i}`} value={`left-${i}`}>{c}</option>)}
                    {rightCols.map((c, i) => <option key={`sr-${i}`} value={`right-${i}`}>{c}</option>)}
                  </select>
                ) : (<input type="date" value={editingTask.start} onChange={(e) => updateTask(editingTask.id, { start: e.target.value })} className="w-full p-1.5 border rounded text-xs" />)}
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">終了地点</label>
                <div className="flex rounded-md border border-slate-200 overflow-hidden">
                  <button onClick={() => updateTask(editingTask.id, { endType: 'special', end: 'right-0' })} className={`flex-1 py-1 text-[10px] font-bold ${editingTask.endType === 'special' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>固定列</button>
                  <button onClick={() => updateTask(editingTask.id, { endType: 'date', end: formatDate(new Date(viewStart)) })} className={`flex-1 py-1 text-[10px] font-bold ${editingTask.endType === 'date' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>カレンダー</button>
                </div>
                {editingTask.endType === 'special' ? (
                  <select value={editingTask.end} onChange={(e) => updateTask(editingTask.id, { end: e.target.value })} className="w-full p-1.5 border rounded text-xs">
                    {leftCols.map((c, i) => <option key={`el-${i}`} value={`left-${i}`}>{c}</option>)}
                    {rightCols.map((c, i) => <option key={`er-${i}`} value={`right-${i}`}>{c}</option>)}
                  </select>
                ) : (<input type="date" value={editingTask.end} onChange={(e) => updateTask(editingTask.id, { end: e.target.value })} className="w-full p-1.5 border rounded text-xs" />)}
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400">カラー</label><div className="grid grid-cols-4 gap-2">{COLORS.map(c => <button key={c.bg} onClick={() => updateTask(editingTask.id, { color: c.bg })} className={`h-8 rounded ${c.bg} ${editingTask.color === c.bg ? 'ring-2 ring-slate-400' : ''}`} />)}</div></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">工程カテゴリ</label><select value={editingTask.category} onChange={(e) => updateTask(editingTask.id, { category: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm bg-white">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="pt-4 border-t"><button onClick={() => deleteTask(editingTask.id)} className="w-full py-2 text-rose-500 text-xs font-bold border border-rose-100 rounded hover:bg-rose-50 flex items-center justify-center space-x-1"><Trash2 size={14}/><span>タスク削除</span></button></div>
            </div>
          </div>
        )}
      </main>

      {showAddCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center space-x-2 text-indigo-600"><PlusCircle size={20}/><span>工程区分の追加</span></h3>
            <div className="space-y-1 mb-6">
              <label className="text-xs font-bold text-slate-400">区分名を入力してください</label>
              <input autoFocus type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="例: テスト工程" />
            </div>
            <div className="flex space-x-3">
              <button onClick={() => { setShowAddCategoryModal(false); setNewCategoryName(''); }} className="flex-1 py-2 bg-slate-100 rounded-lg text-xs font-bold">キャンセル</button>
              <button onClick={handleAddCategory} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700">追加する</button>
            </div>
          </div>
        </div>
      )}

      {categoryConfirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6"><h3 className="font-bold text-lg text-rose-600 mb-2">区分の削除</h3><p className="text-sm text-slate-600 mb-6">「{categoryConfirmDelete}」内のタスクもすべて削除されます。</p><div className="flex space-x-3"><button onClick={() => setCategoryConfirmDelete(null)} className="flex-1 py-2 bg-slate-100 rounded-lg text-xs font-bold">キャンセル</button><button onClick={confirmDeleteCategory} className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md">削除</button></div></div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 font-bold text-sm">設定<button onClick={() => setShowSettings(false)}><X size={18}/></button></div>
            <div className="p-4 space-y-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-3"><label className="text-xs font-bold text-slate-500 uppercase">固定列（左側）</label><div className="flex flex-wrap gap-2">{leftCols.map((c, i) => (<div key={i} className="flex items-center bg-slate-100 rounded px-2 py-1 text-xs font-bold text-slate-600"><span>{c}</span><button onClick={() => setLeftCols(leftCols.filter((_, idx) => idx !== i))} className="ml-2 text-slate-400 hover:text-rose-500"><X size={12}/></button></div>))}<button onClick={() => { const n = window.prompt?.('列名'); if(n) setLeftCols([...leftCols, n]); }} className="text-indigo-600 p-1 border border-indigo-200 rounded hover:bg-indigo-50"><Plus size={12}/></button></div></div>
              <div className="space-y-3"><label className="text-xs font-bold text-slate-500 uppercase">固定列（右側）</label><div className="flex flex-wrap gap-2">{rightCols.map((c, i) => (<div key={i} className="flex items-center bg-slate-100 rounded px-2 py-1 text-xs font-bold text-slate-600"><span>{c}</span><button onClick={() => setRightCols(rightCols.filter((_, idx) => idx !== i))} className="ml-2 text-slate-400 hover:text-rose-500"><X size={12}/></button></div>))}<button onClick={() => { const n = window.prompt?.('列名'); if(n) setRightCols([...rightCols, n]); }} className="text-indigo-600 p-1 border border-indigo-200 rounded hover:bg-indigo-50"><Plus size={12}/></button></div></div>
              <div className="space-y-3 pt-4 border-t"><label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={useJapaneseHolidays} onChange={(e) => setUseJapaneseHolidays(e.target.checked)} className="rounded text-indigo-600" /><span className="text-sm font-medium">日本の祝日を考慮する</span></label><div className="flex justify-between text-xs font-bold text-slate-500"><span>1マスの幅</span><span>{unitWidth}px</span></div><input type="range" min="30" max="250" value={unitWidth} onChange={(e) => setUnitWidth(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end"><button onClick={() => setShowSettings(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md">閉じる</button></div>
          </div>
        </div>
      )}
      <style>{`
        @media print { header, button, .sidebar, input[type="range"] { display: none !important; } body { background: white; } .scrollbar-thin { overflow: visible !important; } main { height: auto !important; overflow: visible !important; } }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; } .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
