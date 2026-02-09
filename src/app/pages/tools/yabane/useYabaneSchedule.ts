import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { PPTX_CDN_URL, PPTX_SCRIPT_ID, PPTX_SHAPE_OFFSET_X, COLORS, MODE_SHIFT, SPECIAL_COL_WIDTH, TASK_HEIGHT, TASK_GAP, type Task, type LaneTask } from './types';
import { normalizeDate, parseDateLocal, formatDate, getFiscalInfo, getISOWeek, getJapaneseHolidays } from './utils';

export function useYabaneSchedule() {
  useEffect(() => { document.title = 'Yabane Schedule | ryoupr'; }, []);

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

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 3000); return () => clearTimeout(t); } }, [message]);

  const holidays = useMemo(() => {
    if (!useJapaneseHolidays) return {};
    const startYear = new Date(viewStart).getFullYear();
    return { ...getJapaneseHolidays(startYear - 1), ...getJapaneseHolidays(startYear), ...getJapaneseHolidays(startYear + 1) };
  }, [viewStart, useJapaneseHolidays]);

  useEffect(() => {
    if (window.PptxGenJS) { setPptxReady(true); return; }
    if (document.getElementById(PPTX_SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = PPTX_SCRIPT_ID; script.src = PPTX_CDN_URL; script.async = true;
    script.onload = () => setPptxReady(true); script.onerror = () => setPptxReady(false);
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
      const side = parts[0]; const idx = parseInt(parts[1] ?? '', 10);
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
      const unitStart = timelineUnits[i]!;
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
      while (lanes[laneIndex] !== undefined && lanes[laneIndex]! > xStart) laneIndex++;
      lanes[laneIndex] = xEnd + 10;
      return { ...task, laneIndex, xStart, width };
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const laneTasksByCategory = useMemo(() => {
    const result: Record<string, LaneTask[]> = {};
    categories.forEach(cat => { result[cat] = getTasksInLanes(tasks.filter(t => t.category === cat)); });
    return result;
  }, [tasks, categories, leftCols, rightCols, timelineUnits, unitWidth, viewMode]);

  const addTask = (category: string) => {
    const newTask: Task = { id: crypto.randomUUID(), title: '新規タスク', start: formatDate(new Date(viewStart)), end: formatDate(new Date(viewStart)), startType: 'date', endType: 'date', color: 'bg-blue-500', category: category || categories[0] || '' };
    setTasks([...tasks, newTask]);
    setEditingTask(newTask);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingTask(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  };

  const deleteTask = (id: string) => { setTasks(tasks.filter(t => t.id !== id)); setEditingTask(null); };

  const draggedRef = useRef(false);
  const handleDragStart = (e: React.DragEvent, taskId: string) => { setDragTaskId(taskId); draggedRef.current = true; e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (!dragTaskId || dragTaskId === targetTaskId) return;
    const si = tasks.findIndex(t => t.id === dragTaskId);
    const ti = tasks.findIndex(t => t.id === targetTaskId);
    if (si === -1 || ti === -1 || tasks[si]?.category !== tasks[ti]?.category) return;
    const newTasks = [...tasks]; const [moved] = newTasks.splice(si, 1); if (moved) newTasks.splice(ti, 0, moved);
    setTasks(newTasks); setDragTaskId(null);
  };
  const handleDragEnd = () => { setDragTaskId(null); setTimeout(() => { draggedRef.current = false; }, 0); };
  const handleTaskClick = (task: Task) => { if (!draggedRef.current) setEditingTask(task); };

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
    const data = { version: "2.0", tasks, categories, viewStart, viewEnd, viewMode, unitWidth, leftCols, rightCols, useJapaneseHolidays };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `yabane-${formatDate(new Date())}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!Array.isArray(data.tasks) || !Array.isArray(data.categories)) throw new Error('invalid format');
        setTasks(data.tasks); setCategories(data.categories);
        if (data.viewStart) setViewStart(data.viewStart);
        if (data.viewEnd) setViewEnd(data.viewEnd);
        if (data.viewMode) setViewMode(data.viewMode);
        if (data.unitWidth) setUnitWidth(data.unitWidth);
        if (Array.isArray(data.leftCols)) setLeftCols(data.leftCols);
        if (Array.isArray(data.rightCols)) setRightCols(data.rightCols);
        if (typeof data.useJapaneseHolidays === 'boolean') setUseJapaneseHolidays(data.useJapaneseHolidays);
        setMessage({ type: 'success', text: 'データを復元しました' });
      } catch { setMessage({ type: 'error', text: '読込失敗: 不正なファイル形式です' }); }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportPPTX = useCallback(async () => {
    if (!pptxReady || !window.PptxGenJS) { setMessage({ type: 'error', text: 'ライブラリ読込中... 再試行してください' }); return; }
    setIsExporting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pptx: any = new window.PptxGenJS();
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
      const activeCategories = categories.filter(cat => tasks.some(t => t.category === cat));
      if (activeCategories.length === 0) { setMessage({ type: 'error', text: '出力するタスクがありません' }); return; }
      const colWidths = [CATEGORY_COL_WIDTH, ...Array(leftCols.length).fill(leftColWidthInch), ...Array(timelineUnits.length).fill(unitWidthInch), ...Array(rightCols.length).fill(rightColWidthInch)];
      if (viewMode === 'day' && timelineUnits.length > 90) { setMessage({ type: 'error', text: '日次モードの表示範囲が広すぎます（90日以内に絞ってください）' }); return; }
      const HEADER_HEIGHT = 0.6, MIN_ROW_HEIGHT = 0.7, TASK_V_STEP = 0.35, TASK_SHAPE_H = 0.25;
      const categoryHeights = activeCategories.map(category => {
        const laneTasks = laneTasksByCategory[category] || [];
        const maxLane = Math.max(-1, ...laneTasks.map(t => t.laneIndex));
        return Math.max(MIN_ROW_HEIGHT, (maxLane + 1) * TASK_V_STEP + 0.3);
      });
      const tableRowHeights = [HEADER_HEIGHT, ...categoryHeights];
      const headerOptions = { fill: 'F1F5F9', bold: true, align: 'center' as const, valign: 'middle' as const, border: { pt: 1, color: 'CBD5E1' }, fontSize: 10, margin: 0 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headerRow: any[] = [{ text: "工程区分", options: headerOptions }];
      leftCols.forEach(c => headerRow.push({ text: c, options: { ...headerOptions, fill: 'E2E8F0' } }));
      timelineUnits.forEach(date => {
        const isHolidayMode = viewMode === 'day';
        const isHoliday = isHolidayMode && useJapaneseHolidays && holidays[formatDate(date)];
        const isSun = isHolidayMode && date.getDay() === 0;
        let label = "";
        if (viewMode === 'day') label = `${date.getMonth() + 1}/${date.getDate()}`;
        else if (viewMode === 'week') label = `W${getISOWeek(date)}`;
        else if (viewMode === 'month') label = `${date.getFullYear()}年\n${date.getMonth() + 1}月`;
        else if (viewMode === 'year') label = `${date.getFullYear()}年`;
        else if (viewMode === 'fy') label = getFiscalInfo(date).label;
        headerRow.push({ text: label, options: { ...headerOptions, fill: (isHoliday || isSun) ? 'FFE4E6' : 'F1F5F9' } });
      });
      rightCols.forEach(c => headerRow.push({ text: c, options: { ...headerOptions, fill: 'E2E8F0' } }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tableRows: any[][] = [headerRow];
      activeCategories.forEach(cat => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: any[] = [{ text: cat, options: { bold: true, valign: 'middle', align: 'center', border: { pt: 1, color: 'CBD5E1' }, margin: 0 } }];
        for (let i = 0; i < leftCols.length + timelineUnits.length + rightCols.length; i++) row.push({ text: "", options: { border: { pt: 1, color: 'F1F5F9' }, margin: 0 } });
        tableRows.push(row);
      });
      const totalTableWidthInch = colWidths.reduce((sum: number, w: number) => sum + w, 0);
      slide.addTable(tableRows, { x: START_X, y: START_Y, w: totalTableWidthInch, colW: colWidths, rowH: tableRowHeights, autoPage: false });
      activeCategories.forEach((category, catIdx) => {
        const laneTasks = laneTasksByCategory[category] || [];
        let currentCatY = START_Y + HEADER_HEIGHT;
        for (let i = 0; i < catIdx; i++) currentCatY += (categoryHeights[i] ?? 0);
        laneTasks.forEach(task => {
          let shapeX_px = task.xStart, shapeW_px = task.width;
          if (shapeX_px < 0) { shapeW_px += shapeX_px; shapeX_px = 0; }
          if (shapeX_px + shapeW_px > totalTimelineWidth) shapeW_px = totalTimelineWidth - shapeX_px;
          const shapeX = START_X + CATEGORY_COL_WIDTH + shapeX_px * pxToInch + PPTX_SHAPE_OFFSET_X;
          const shapeW = shapeW_px * pxToInch;
          const shapeY = currentCatY + 0.15 + task.laneIndex * TASK_V_STEP;
          if (shapeW > 0) {
            const colorObj = COLORS.find(c => c.bg === task.color) || COLORS[0]!;
            slide.addShape(pptx.ShapeType.chevron, { x: shapeX, y: shapeY, w: shapeW, h: TASK_SHAPE_H, fill: { color: colorObj.hex }, line: { color: 'FFFFFF', width: 1 } });
            slide.addText(task.title, { x: shapeX, y: shapeY, w: shapeW, h: TASK_SHAPE_H, fontSize: 8, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });
          }
        });
      });
      await pptx.writeFile({ fileName: `yabane-schedule-${formatDate(new Date())}.pptx` });
      setMessage({ type: 'success', text: 'PPTX出力完了' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { setMessage({ type: 'error', text: `PPTX出力エラー: ${err.message}` }); } finally { setIsExporting(false); }
  }, [pptxReady, categories, tasks, totalTimelineWidth, unitWidth, leftCols, rightCols, timelineUnits, viewMode, useJapaneseHolidays, holidays, laneTasksByCategory]);

  const addLeftCol = () => { const n = window.prompt?.('列名')?.trim(); if (n) setLeftCols([...leftCols, DOMPurify.sanitize(n)]); };
  const addRightCol = () => { const n = window.prompt?.('列名')?.trim(); if (n) setRightCols([...rightCols, DOMPurify.sanitize(n)]); };

  return {
    tasks, categories, viewStart, viewEnd, viewMode, unitWidth, leftCols, rightCols,
    editingTask, showSettings, showRangePicker, showAddCategoryModal, newCategoryName,
    categoryConfirmDelete, message, isExporting, pptxReady, dragTaskId, useJapaneseHolidays,
    fileInputRef, timelineRef, rangePickerRef,
    holidays, timelineUnits, totalTimelineWidth, laneTasksByCategory,
    setViewMode, setShowSettings, setShowRangePicker, setShowAddCategoryModal, setNewCategoryName,
    setCategoryConfirmDelete, setEditingTask, setUnitWidth, setUseJapaneseHolidays,
    setLeftCols, setRightCols, setViewStart, setViewEnd,
    addTask, updateTask, deleteTask, shiftView,
    handleDragStart, handleDragOver, handleDrop, handleDragEnd, handleTaskClick,
    attemptDeleteCategory, confirmDeleteCategory, handleAddCategory,
    handleExportJSON, handleImportJSON, handleExportPPTX,
    addLeftCol, addRightCol,
    TASK_HEIGHT, TASK_GAP,
  };
}
