import {
  AlertCircle,
  CalendarDays,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileJson,
  GripVertical,
  Loader2,
  Plus,
  PlusCircle,
  Presentation,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { CDN_LIBS } from '../../cdnConfig';
import { TrailLayout } from '../../components/trail/TrailLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { YabaneSettingsDialog } from './YabaneSettingsDialog';
import { YabaneTaskEditor } from './YabaneTaskEditor';
import {
  COLORS,
  formatDate,
  getFiscalInfo,
  getISOWeek,
  getJapaneseHolidays,
  type LaneTask,
  MODE_SHIFT,
  normalizeDate,
  parseDateLocal,
  SPECIAL_COL_WIDTH,
  TASK_GAP,
  TASK_HEIGHT,
  type Task,
  VIEW_MODES,
} from './yabaneScheduleHelpers';
import { generateYabanePptx } from './yabaneSchedulePptx';

// PptxGenJS CDN type declaration
interface PptxGenInstance {
  defineLayout(opts: { name: string; width: number; height: number }): void;
  layout: string;
  addSlide(): Record<string, unknown>;
  writeFile(opts: { fileName: string }): Promise<void>;
}

declare global {
  interface Window {
    PptxGenJS?: new () => PptxGenInstance;
  }
}

const PPTX_CDN_URL = CDN_LIBS.pptxgenjs.url;
const PPTX_SCRIPT_ID = 'pptxgenjs-cdn';

// --- Main Component ---

export function YabaneSchedulePage() {
  usePageTitle('Yabane Schedule');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: '要件定義',
      start: '2026-04-05',
      end: '2026-04-15',
      color: 'bg-blue-500',
      category: '設計',
      startType: 'date',
      endType: 'date',
    },
    {
      id: '2',
      title: '基本設計',
      start: '2026-04-12',
      end: '2026-04-25',
      color: 'bg-emerald-500',
      category: '設計',
      startType: 'date',
      endType: 'date',
    },
    {
      id: '3',
      title: '全社展開',
      start: 'left-0',
      end: '2026-06-30',
      color: 'bg-purple-500',
      category: '開発',
      startType: 'special',
      endType: 'date',
    },
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
  const [categoryConfirmDelete, setCategoryConfirmDelete] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [pptxReady, setPptxReady] = useState(() => !!window.PptxGenJS);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [useJapaneseHolidays, setUseJapaneseHolidays] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const rangePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        rangePickerRef.current &&
        !rangePickerRef.current.contains(event.target as Node)
      )
        setShowRangePicker(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const holidays = useMemo(() => {
    if (!useJapaneseHolidays) return {};
    const startYear = new Date(viewStart).getFullYear();
    return {
      ...getJapaneseHolidays(startYear - 1),
      ...getJapaneseHolidays(startYear),
      ...getJapaneseHolidays(startYear + 1),
    };
  }, [viewStart, useJapaneseHolidays]);

  useEffect(() => {
    if (window.PptxGenJS) {
      setPptxReady(true);
      return;
    }
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

  const totalTimelineWidth = useMemo(
    () =>
      (leftCols.length + rightCols.length) * SPECIAL_COL_WIDTH +
      timelineUnits.length * unitWidth,
    [leftCols, rightCols, timelineUnits, unitWidth]
  );

  const getXForLocation = (
    type: string,
    val: string,
    isEndDate = false
  ): number => {
    if (type === 'special') {
      if (!val || typeof val !== 'string') return 0;
      const parts = val.split('-');
      if (parts.length < 2) return 0;
      const side = parts[0];
      const idx = parseInt(parts[1], 10);
      if (isNaN(idx)) return 0;
      if (side === 'left')
        return idx * SPECIAL_COL_WIDTH + (isEndDate ? SPECIAL_COL_WIDTH : 0);
      return (
        leftCols.length * SPECIAL_COL_WIDTH +
        timelineUnits.length * unitWidth +
        idx * SPECIAL_COL_WIDTH +
        (isEndDate ? SPECIAL_COL_WIDTH : 0)
      );
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
        const progress =
          (targetTime - unitStart.getTime()) /
          (unitEnd.getTime() - unitStart.getTime());
        return offsetLeft + i * unitWidth + progress * unitWidth;
      }
    }
    return offsetLeft + timelineUnits.length * unitWidth;
  };

  const getTasksInLanes = (categoryTasks: Task[]): LaneTask[] => {
    const lanes: number[] = [];
    const calendarEndX =
      leftCols.length * SPECIAL_COL_WIDTH + timelineUnits.length * unitWidth;
    const timelineEndX = calendarEndX + rightCols.length * SPECIAL_COL_WIDTH;
    return categoryTasks.map((task) => {
      let xStart = getXForLocation(task.startType || 'date', task.start, false);
      let xEnd = getXForLocation(task.endType || 'date', task.end, true);
      if (task.endType === 'date' || !task.endType) {
        if (xEnd > calendarEndX) xEnd = calendarEndX;
      }
      if (xEnd > timelineEndX) xEnd = timelineEndX;
      if (xStart < 0) xStart = 0;
      let width = xEnd - xStart;
      if (width < 24) width = 24;
      let laneIndex = 0;
      while (lanes[laneIndex] !== undefined && lanes[laneIndex] > xStart)
        laneIndex++;
      lanes[laneIndex] = xEnd + 10;
      return { ...task, laneIndex, xStart, width };
    });
  };

  const laneTasksByCategory = useMemo(() => {
    const result: Record<string, LaneTask[]> = {};
    categories.forEach((cat) => {
      result[cat] = getTasksInLanes(tasks.filter((t) => t.category === cat));
    });
    return result;
  }, [
    tasks,
    categories,
    leftCols,
    rightCols,
    timelineUnits,
    unitWidth,
    viewMode,
  ]);

  const addTask = (category: string) => {
    const newTask: Task = {
      id:
        crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: '新規タスク',
      start: formatDate(new Date(viewStart)),
      end: formatDate(new Date(viewStart)),
      startType: 'date',
      endType: 'date',
      color: 'bg-blue-500',
      category: category || categories[0],
    };
    setTasks([...tasks, newTask]);
    setEditingTask(newTask);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    setEditingTask((prev) =>
      prev && prev.id === id ? { ...prev, ...updates } : prev
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setEditingTask(null);
  };

  const draggedRef = useRef(false);
  const dragEndTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    clearTimeout(dragEndTimerRef.current);
    setDragTaskId(taskId);
    draggedRef.current = true;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (!dragTaskId || dragTaskId === targetTaskId) return;
    const si = tasks.findIndex((t) => t.id === dragTaskId);
    const ti = tasks.findIndex((t) => t.id === targetTaskId);
    if (si === -1 || ti === -1 || tasks[si].category !== tasks[ti].category)
      return;
    const newTasks = [...tasks];
    const [moved] = newTasks.splice(si, 1);
    newTasks.splice(ti, 0, moved);
    setTasks(newTasks);
    setDragTaskId(null);
  };
  const handleDragEnd = () => {
    setDragTaskId(null);
    dragEndTimerRef.current = setTimeout(() => {
      draggedRef.current = false;
    }, 50);
  };
  const handleTaskClick = (task: Task) => {
    if (!draggedRef.current) setEditingTask(task);
  };

  const attemptDeleteCategory = (catName: string) => {
    if (tasks.some((t) => t.category === catName))
      setCategoryConfirmDelete(catName);
    else setCategories(categories.filter((c) => c !== catName));
  };
  const confirmDeleteCategory = () => {
    setTasks(tasks.filter((t) => t.category !== categoryConfirmDelete));
    setCategories(categories.filter((c) => c !== categoryConfirmDelete));
    setCategoryConfirmDelete(null);
  };
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName('');
      setShowAddCategoryModal(false);
    }
  };

  const shiftView = (dir: number) => {
    const s = parseDateLocal(viewStart);
    const e = parseDateLocal(viewEnd);
    const amount = dir * (MODE_SHIFT[viewMode] || 30);
    s.setDate(s.getDate() + amount);
    e.setDate(e.getDate() + amount);
    setViewStart(formatDate(s));
    setViewEnd(formatDate(e));
  };

  const handleExportJSON = () => {
    const data = {
      version: '2.0',
      tasks,
      categories,
      viewStart,
      viewEnd,
      viewMode,
      unitWidth,
      leftCols,
      rightCols,
      useJapaneseHolidays,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yabane-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result;
        if (typeof raw !== 'string') throw new Error('invalid file');
        const data = JSON.parse(raw);
        if (
          !data ||
          typeof data !== 'object' ||
          !Array.isArray(data.tasks) ||
          !Array.isArray(data.categories)
        )
          throw new Error('invalid format');
        setTasks(data.tasks);
        setCategories(data.categories);
        if (data.viewStart) setViewStart(data.viewStart);
        if (data.viewEnd) setViewEnd(data.viewEnd);
        if (data.viewMode) setViewMode(data.viewMode);
        if (data.unitWidth) setUnitWidth(data.unitWidth);
        if (Array.isArray(data.leftCols)) setLeftCols(data.leftCols);
        if (Array.isArray(data.rightCols)) setRightCols(data.rightCols);
        if (typeof data.useJapaneseHolidays === 'boolean')
          setUseJapaneseHolidays(data.useJapaneseHolidays);
        setMessage({ type: 'success', text: 'データを復元しました' });
      } catch {
        setMessage({ type: 'error', text: '読込失敗: 不正なファイル形式です' });
      }
      e.target.value = '';
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'ファイルの読み込みに失敗しました' });
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportPPTX = useCallback(async () => {
    if (!pptxReady || !window.PptxGenJS) {
      setMessage({
        type: 'error',
        text: 'ライブラリ読込中... 再試行してください',
      });
      return;
    }
    setIsExporting(true);
    try {
      const pptx = new window.PptxGenJS();
      await generateYabanePptx(pptx, {
        categories,
        tasks,
        totalTimelineWidth,
        unitWidth,
        leftCols,
        rightCols,
        timelineUnits,
        viewMode,
        useJapaneseHolidays,
        holidays,
        laneTasksByCategory,
        colors: COLORS,
        formatDate,
        getISOWeek,
        getFiscalInfo,
      });
      setMessage({ type: 'success', text: 'PPTX出力完了' });
    } catch (err: any) {
      setMessage({ type: 'error', text: `PPTX出力エラー: ${err.message}` });
    } finally {
      setIsExporting(false);
    }
  }, [
    pptxReady,
    categories,
    tasks,
    totalTimelineWidth,
    unitWidth,
    leftCols,
    rightCols,
    timelineUnits,
    viewMode,
    useJapaneseHolidays,
    holidays,
    laneTasksByCategory,
  ]);

  return (
    <TrailLayout variant="app">
      <div className="yabane-root flex min-h-0 flex-1 flex-col overflow-hidden">
        {message && (
          <div
            className={`fixed top-16 left-1/2 z-[100] flex -translate-x-1/2 items-center space-x-2 border-[1.5px] border-ink px-4 py-2 ${message.type === 'error' ? 'bg-rose-600 text-white' : 'bg-ink text-ground'}`}
          >
            {message.type === 'error' ? (
              <AlertCircle size={18} />
            ) : (
              <Check size={18} />
            )}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        <header className="z-30 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-[1.5px] border-ink bg-surface px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              to="/tools"
              className="tg-nav-link tg-label whitespace-nowrap hover:text-ink"
            >
              ← ツール一覧
            </Link>
            <div className="bg-ink p-1.5 text-ground">
              <CalendarIcon size={20} />
            </div>
            <h1 className="tg-display hidden text-xl lg:block">
              矢羽スケジュール
            </h1>
            <div className="flex items-center gap-1">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  aria-pressed={viewMode === mode.id}
                  className="tg-chip"
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative" ref={rangePickerRef}>
              <div className="flex items-center overflow-hidden border-[1.5px] border-ink bg-surface">
                <button
                  onClick={() => shiftView(-1)}
                  className="border-r border-line p-1.5 hover:bg-ground"
                  aria-label="前の期間"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setShowRangePicker(!showRangePicker)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-ground"
                >
                  <CalendarDays size={14} className="text-webbing" />
                  <span>
                    {viewStart.replace(/-/g, '/')} 〜{' '}
                    {viewEnd.replace(/-/g, '/')}
                  </span>
                </button>
                <button
                  onClick={() => shiftView(1)}
                  className="border-l border-line p-1.5 hover:bg-ground"
                  aria-label="次の期間"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              {showRangePicker && (
                <div className="absolute top-full left-1/2 z-50 mt-2 w-80 -translate-x-1/2 border-[1.5px] border-ink bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between border-b border-line pb-2 text-sm font-bold">
                    表示範囲設定
                    <button onClick={() => setShowRangePicker(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-ink-muted">
                        開始日
                      </label>
                      <input
                        type="date"
                        value={viewStart}
                        onChange={(e) => {
                          if (e.target.value <= viewEnd)
                            setViewStart(e.target.value);
                        }}
                        className="w-full border border-line bg-surface px-3 py-2 text-sm"
                        max={viewEnd}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-ink-muted">
                        終了日
                      </label>
                      <input
                        type="date"
                        value={viewEnd}
                        onChange={(e) => {
                          if (e.target.value >= viewStart)
                            setViewEnd(e.target.value);
                        }}
                        className="w-full border border-line bg-surface px-3 py-2 text-sm"
                        min={viewStart}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRangePicker(false)}
                    className="tg-btn mt-4 w-full justify-center"
                  >
                    適用
                  </button>
                </div>
              )}
            </div>
            <div className="mx-1 h-6 w-px bg-line" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-ink-muted hover:bg-ground"
                title="JSON読込"
              >
                <Upload size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJSON}
                className="hidden"
                accept=".json"
              />
              <button
                onClick={handleExportJSON}
                className="p-2 text-ink-muted hover:bg-ground"
                title="JSON保存"
              >
                <FileJson size={18} />
              </button>
              <button
                onClick={handleExportPPTX}
                disabled={isExporting || !pptxReady}
                className="p-2 text-webbing hover:bg-ground disabled:opacity-50"
                title={pptxReady ? 'PowerPoint出力' : 'ライブラリ読込中...'}
              >
                {isExporting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Presentation size={18} />
                )}
              </button>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-ink-muted hover:bg-ground"
              title="設定"
              aria-label="設定"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={() => window.print()}
              className="tg-btn"
              aria-label="印刷"
            >
              <Download size={14} />
              <span>印刷</span>
            </button>
          </div>
        </header>

        <div className="yabane-main relative flex min-h-0 flex-1 overflow-hidden bg-surface">
          <div
            className="scrollbar-thin flex flex-1 flex-col overflow-auto"
            ref={timelineRef}
          >
            <div className="sticky top-0 z-20 flex w-max min-w-full border-b border-line bg-surface">
              <div className="flex w-40 flex-shrink-0 items-center justify-center border-r border-line bg-ground text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                工程区分
              </div>
              <div
                className="flex items-stretch"
                style={{ width: `${totalTimelineWidth}px` }}
              >
                {leftCols.map((c, i) => (
                  <div
                    key={`l-${i}`}
                    style={{ width: `${SPECIAL_COL_WIDTH}px` }}
                    className="flex-shrink-0 border-r border-line bg-ground flex items-center justify-center text-[10px] font-bold text-ink-muted"
                  >
                    {c}
                  </div>
                ))}
                {timelineUnits.map((date, i) => {
                  const dateStr = formatDate(date);
                  const isHolidayMode = viewMode === 'day';
                  const holidayName =
                    isHolidayMode && useJapaneseHolidays
                      ? holidays[dateStr]
                      : null;
                  const isSun = isHolidayMode && date.getDay() === 0;
                  let mainLabel = '',
                    subLabel = '';
                  if (viewMode === 'day') {
                    mainLabel =
                      date.getDate() === 1 || i === 0
                        ? `${date.getMonth() + 1}月`
                        : '';
                    subLabel = date.getDate().toString();
                  } else if (viewMode === 'week') {
                    mainLabel = `${date.getMonth() + 1}月`;
                    subLabel = `W${getISOWeek(date)}`;
                  } else if (viewMode === 'month') {
                    mainLabel = `${date.getFullYear()}年`;
                    subLabel = `${date.getMonth() + 1}月`;
                  } else if (viewMode === 'year') {
                    subLabel = `${date.getFullYear()}年`;
                  } else if (viewMode === 'fy') {
                    subLabel = getFiscalInfo(date).label;
                  }
                  return (
                    <div
                      key={i}
                      style={{ width: `${unitWidth}px` }}
                      className={`relative flex flex-shrink-0 flex-col items-center justify-center border-r border-line py-2 ${holidayName || isSun ? 'bg-line/45' : ''}`}
                    >
                      {mainLabel && (
                        <span className="absolute top-1 whitespace-nowrap text-[9px] font-bold text-webbing">
                          {mainLabel}
                        </span>
                      )}
                      <span
                        className={`pt-2 text-xs font-bold ${holidayName || isSun ? 'text-ink' : 'text-ink-muted'}`}
                      >
                        {subLabel}
                      </span>
                    </div>
                  );
                })}
                {rightCols.map((c, i) => (
                  <div
                    key={`r-${i}`}
                    style={{ width: `${SPECIAL_COL_WIDTH}px` }}
                    className="flex-shrink-0 border-r border-line bg-ground flex items-center justify-center text-[10px] font-bold text-ink-muted"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-full w-max">
              {categories.map((category) => {
                const laneTasks = laneTasksByCategory[category] || [];
                const maxLane = Math.max(
                  -1,
                  ...laneTasks.map((t) => t.laneIndex)
                );
                const swimlaneHeight = Math.max(
                  70,
                  (maxLane + 1) * (TASK_HEIGHT + TASK_GAP) + 12
                );
                return (
                  <div
                    key={category}
                    className="group/row flex border-b border-line"
                    style={{ height: `${swimlaneHeight}px` }}
                  >
                    <div className="group/cat sticky left-0 z-10 flex w-40 flex-shrink-0 items-center border-r border-line bg-surface px-4">
                      <span className="mr-10 truncate text-sm font-bold text-ink">
                        {category}
                      </span>
                      <div className="absolute right-1 flex items-center space-x-0.5 bg-surface/90 pl-1 opacity-0 backdrop-blur-sm transition-opacity group-hover/cat:opacity-100">
                        <button
                          onClick={() => addTask(category)}
                          className="p-1 text-ink-muted hover:bg-ground hover:text-webbing"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => attemptDeleteCategory(category)}
                          className="p-1 text-ink-muted hover:bg-ground hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div
                      className="flex relative items-stretch"
                      style={{ width: `${totalTimelineWidth}px` }}
                    >
                      <div className="absolute inset-0 flex items-stretch pointer-events-none">
                        {leftCols.map((_, i) => (
                          <div
                            key={`lg-${i}`}
                            style={{ width: `${SPECIAL_COL_WIDTH}px` }}
                            className="flex-shrink-0 border-r border-line bg-line/20"
                          />
                        ))}
                        {timelineUnits.map((_, i) => (
                          <div
                            key={i}
                            style={{ width: `${unitWidth}px` }}
                            className="flex-shrink-0 border-r border-line/50"
                          />
                        ))}
                        {rightCols.map((_, i) => (
                          <div
                            key={`rg-${i}`}
                            style={{ width: `${SPECIAL_COL_WIDTH}px` }}
                            className="flex-shrink-0 border-r border-line bg-line/20"
                          />
                        ))}
                      </div>
                      <div className="relative w-full py-4 overflow-hidden">
                        {laneTasks.map((task) => {
                          const top = task.laneIndex * (TASK_HEIGHT + TASK_GAP);
                          return (
                            <div
                              key={task.id}
                              style={{
                                left: `${task.xStart + 5}px`,
                                width: `${task.width - 10}px`,
                                top: `${top}px`,
                                height: `${TASK_HEIGHT}px`,
                                opacity: dragTaskId === task.id ? 0.5 : 1,
                              }}
                              className="absolute transition-all hover:z-10 flex items-center justify-center cursor-move"
                              draggable="true"
                              role="listitem"
                              aria-label={`タスク: ${task.label}。ドラッグで並び替え可能。クリックで編集。`}
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, task.id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => handleTaskClick(task)}
                            >
                              <div
                                className={`absolute inset-0 ${task.color} opacity-90 ring-offset-1 ring-offset-ground group ${editingTask?.id === task.id ? 'ring-2 ring-webbing' : ''}`}
                                style={{
                                  clipPath:
                                    'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)',
                                }}
                              >
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 text-white">
                                  <GripVertical size={12} />
                                </div>
                              </div>
                              <span className="relative z-10 w-full truncate px-6 text-center text-[9px] font-bold text-white pointer-events-none">
                                {task.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex min-h-[48px] border-b border-line bg-surface/50">
                <div className="sticky left-0 z-10 flex w-40 flex-shrink-0 items-center border-r border-line bg-surface px-4">
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="flex items-center space-x-2 text-xs font-bold text-webbing transition-colors hover:text-ink"
                  >
                    <Plus size={14} />
                    <span>区分追加</span>
                  </button>
                </div>
                <div
                  className="flex relative items-stretch"
                  style={{ width: `${totalTimelineWidth}px` }}
                >
                  <div className="absolute inset-0 flex items-stretch pointer-events-none">
                    {leftCols.map((_, i) => (
                      <div
                        key={`lg-${i}`}
                        style={{ width: `${SPECIAL_COL_WIDTH}px` }}
                        className="flex-shrink-0 border-r border-line bg-line/20"
                      />
                    ))}
                    {timelineUnits.map((_, i) => (
                      <div
                        key={i}
                        style={{ width: `${unitWidth}px` }}
                        className="flex-shrink-0 border-r border-line/50"
                      />
                    ))}
                    {rightCols.map((_, i) => (
                      <div
                        key={`rg-${i}`}
                        style={{ width: `${SPECIAL_COL_WIDTH}px` }}
                        className="flex-shrink-0 border-r border-line bg-line/20"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {editingTask && (
            <YabaneTaskEditor
              task={editingTask}
              categories={categories}
              leftCols={leftCols}
              rightCols={rightCols}
              viewStart={viewStart}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onClose={() => setEditingTask(null)}
            />
          )}
        </div>

        {showAddCategoryModal && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="工程区分の追加"
          >
            <div className="tg-panel w-80 p-6">
              <h3 className="tg-display mb-4 flex items-center space-x-2 text-lg">
                <PlusCircle size={20} />
                <span>工程区分の追加</span>
              </h3>
              <div className="mb-6 space-y-1">
                <label className="text-xs font-bold text-ink-muted">
                  区分名を入力してください
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  className="w-full border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-webbing"
                  placeholder="例: テスト工程"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCategoryName('');
                  }}
                  className="tg-btn tg-btn-ghost flex-1 justify-center"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddCategory}
                  className="tg-btn flex-1 justify-center"
                >
                  追加する
                </button>
              </div>
            </div>
          </div>
        )}

        {categoryConfirmDelete && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            role="alertdialog"
            aria-modal="true"
            aria-label="区分の削除確認"
          >
            <div className="tg-panel w-80 p-6">
              <h3 className="tg-display mb-2 text-lg text-destructive">
                区分の削除
              </h3>
              <p className="mb-6 text-sm text-ink-muted">
                「{categoryConfirmDelete}」内のタスクもすべて削除されます。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCategoryConfirmDelete(null)}
                  className="tg-btn tg-btn-ghost flex-1 justify-center"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="flex-1 border-[1.5px] border-rose-600 bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <YabaneSettingsDialog
            leftCols={leftCols}
            rightCols={rightCols}
            unitWidth={unitWidth}
            useJapaneseHolidays={useJapaneseHolidays}
            onLeftColsChange={setLeftCols}
            onRightColsChange={setRightCols}
            onUnitWidthChange={setUnitWidth}
            onHolidaysChange={setUseJapaneseHolidays}
            onClose={() => setShowSettings(false)}
          />
        )}
        <style>{`
          @media print { header, button, .sidebar, input[type="range"] { display: none !important; } [data-mode="night"] .theme-trail { --tg-ground: #ffffff; --tg-surface: #ffffff; --tg-ink: #1f2d44; --tg-muted: #5c6475; --tg-line: #c9c5b8; } body { background: white; } .scrollbar-thin { overflow: visible !important; } .theme-trail, .theme-trail main, .yabane-root, .yabane-main { height: auto !important; overflow: visible !important; } }
          .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; } .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--tg-line); }
        `}</style>
      </div>
    </TrailLayout>
  );
}
