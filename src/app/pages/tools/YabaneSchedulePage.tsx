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
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {message && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${message.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'} text-white`}
        >
          {message.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <Check size={18} />
          )}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm z-30">
        <div className="flex items-center space-x-4">
          <Link
            to="/tools"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
          >
            ← ツール一覧
          </Link>
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <CalendarIcon size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tight hidden lg:block text-slate-700">
            矢羽スケジュール
          </h1>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === mode.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative" ref={rangePickerRef}>
            <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
              <button
                onClick={() => shiftView(-1)}
                className="p-1.5 hover:bg-slate-50 border-r border-slate-200"
                aria-label="前の期間"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setShowRangePicker(!showRangePicker)}
                className="px-3 py-1.5 text-xs font-bold flex items-center space-x-2 hover:bg-slate-50 transition-colors"
              >
                <CalendarDays size={14} className="text-indigo-500" />
                <span>
                  {viewStart.replace(/-/g, '/')} 〜 {viewEnd.replace(/-/g, '/')}
                </span>
              </button>
              <button
                onClick={() => shiftView(1)}
                className="p-1.5 hover:bg-slate-50 border-l border-slate-200"
                aria-label="次の期間"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            {showRangePicker && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 font-bold text-sm">
                  表示範囲設定
                  <button onClick={() => setShowRangePicker(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">
                      開始日
                    </label>
                    <input
                      type="date"
                      value={viewStart}
                      onChange={(e) => {
                        if (e.target.value <= viewEnd)
                          setViewStart(e.target.value);
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      max={viewEnd}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">
                      終了日
                    </label>
                    <input
                      type="date"
                      value={viewEnd}
                      onChange={(e) => {
                        if (e.target.value >= viewStart)
                          setViewEnd(e.target.value);
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      min={viewStart}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowRangePicker(false)}
                  className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                >
                  適用
                </button>
              </div>
            )}
          </div>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <div className="flex items-center space-x-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-slate-100 rounded-md text-slate-500"
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
              className="p-2 hover:bg-slate-100 rounded-md text-slate-500"
              title="JSON保存"
            >
              <FileJson size={18} />
            </button>
            <button
              onClick={handleExportPPTX}
              disabled={isExporting || !pptxReady}
              className="p-2 hover:bg-slate-100 rounded-md text-indigo-600 disabled:opacity-50"
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
            className="p-2 hover:bg-slate-100 rounded-md text-slate-500"
            title="設定"
            aria-label="設定"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => window.print()}
            className="bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-xs font-bold flex items-center space-x-1 shadow-sm"
            aria-label="印刷"
          >
            <Download size={14} />
            <span>印刷</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <div
          className="flex-1 flex flex-col overflow-auto scrollbar-thin"
          ref={timelineRef}
        >
          <div className="sticky top-0 z-20 flex bg-white border-b border-slate-200 min-w-full w-max">
            <div className="w-40 flex-shrink-0 border-r border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                  className="flex-shrink-0 border-r border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600"
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
                    className={`flex-shrink-0 flex flex-col items-center justify-center py-2 border-r border-slate-100 relative ${holidayName || isSun ? 'bg-rose-50' : ''}`}
                  >
                    {mainLabel && (
                      <span className="absolute top-1 text-[9px] font-bold text-indigo-500 whitespace-nowrap">
                        {mainLabel}
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold pt-2 ${holidayName || isSun ? 'text-rose-600' : 'text-slate-600'}`}
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
                  className="flex-shrink-0 border-r border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600"
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
                  className="flex border-b border-slate-100 group/row"
                  style={{ height: `${swimlaneHeight}px` }}
                >
                  <div className="w-40 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10 flex items-center px-4 relative group/cat">
                    <span className="text-sm font-bold text-slate-600 truncate mr-10">
                      {category}
                    </span>
                    <div className="absolute right-1 flex items-center space-x-0.5 opacity-0 group-hover/cat:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm pl-1">
                      <button
                        onClick={() => addTask(category)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => attemptDeleteCategory(category)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500"
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
                          className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30"
                        />
                      ))}
                      {timelineUnits.map((_, i) => (
                        <div
                          key={i}
                          style={{ width: `${unitWidth}px` }}
                          className="flex-shrink-0 border-r border-slate-100/50"
                        />
                      ))}
                      {rightCols.map((_, i) => (
                        <div
                          key={`rg-${i}`}
                          style={{ width: `${SPECIAL_COL_WIDTH}px` }}
                          className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30"
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
                              className={`absolute inset-0 ${task.color} opacity-90 shadow-sm ${editingTask?.id === task.id ? 'ring-2 ring-indigo-400 ring-offset-1' : ''} group`}
                              style={{
                                clipPath:
                                  'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)',
                              }}
                            >
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 text-white">
                                <GripVertical size={12} />
                              </div>
                            </div>
                            <span className="relative z-10 text-[9px] font-bold text-white px-6 truncate pointer-events-none drop-shadow-sm w-full text-center">
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
            <div className="flex border-b border-slate-100 min-h-[48px] bg-slate-50/30">
              <div className="w-40 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10 flex items-center px-4">
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="flex items-center space-x-2 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors"
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
                      className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30"
                    />
                  ))}
                  {timelineUnits.map((_, i) => (
                    <div
                      key={i}
                      style={{ width: `${unitWidth}px` }}
                      className="flex-shrink-0 border-r border-slate-100/50"
                    />
                  ))}
                  {rightCols.map((_, i) => (
                    <div
                      key={`rg-${i}`}
                      style={{ width: `${SPECIAL_COL_WIDTH}px` }}
                      className="flex-shrink-0 border-r border-slate-200 bg-slate-50/30"
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
      </main>

      {showAddCategoryModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="工程区分の追加"
        >
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center space-x-2 text-indigo-600">
              <PlusCircle size={20} />
              <span>工程区分の追加</span>
            </h3>
            <div className="space-y-1 mb-6">
              <label className="text-xs font-bold text-slate-400">
                区分名を入力してください
              </label>
              <input
                autoFocus
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例: テスト工程"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                }}
                className="flex-1 py-2 bg-slate-100 rounded-lg text-xs font-bold"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700"
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}

      {categoryConfirmDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-label="区分の削除確認"
        >
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6">
            <h3 className="font-bold text-lg text-rose-600 mb-2">区分の削除</h3>
            <p className="text-sm text-slate-600 mb-6">
              「{categoryConfirmDelete}」内のタスクもすべて削除されます。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setCategoryConfirmDelete(null)}
                className="flex-1 py-2 bg-slate-100 rounded-lg text-xs font-bold"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md"
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
        @media print { header, button, .sidebar, input[type="range"] { display: none !important; } body { background: white; } .scrollbar-thin { overflow: visible !important; } main { height: auto !important; overflow: visible !important; } }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; } .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
