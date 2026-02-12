import { Edit2, Trash2, X } from 'lucide-react';
import { COLORS, formatDate, type Task } from './yabaneScheduleHelpers';

interface Props {
  task: Task;
  categories: string[];
  leftCols: string[];
  rightCols: string[];
  viewStart: string;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function YabaneTaskEditor({
  task,
  categories,
  leftCols,
  rightCols,
  viewStart,
  onUpdate,
  onDelete,
  onClose,
}: Props) {
  return (
    <div className="w-72 bg-white border-l border-slate-200 shadow-xl z-30 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between bg-slate-50 text-slate-700 font-bold text-sm">
        <div className="flex items-center space-x-2">
          <Edit2 size={14} />
          <span>タスク詳細</span>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="p-4 space-y-5 overflow-y-auto">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            タスク名
          </label>
          <input
            type="text"
            value={task.title}
            onChange={(e) => onUpdate(task.id, { title: e.target.value })}
            className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <DatePointSelector
          label="開始地点"
          type={task.startType}
          value={task.start}
          leftCols={leftCols}
          rightCols={rightCols}
          onTypeChange={(startType, start) =>
            onUpdate(task.id, { startType, start })
          }
          onChange={(start) => onUpdate(task.id, { start })}
          defaultSpecial="left-0"
          defaultDate={formatDate(new Date(viewStart))}
          optionPrefix="s"
        />
        <DatePointSelector
          label="終了地点"
          type={task.endType}
          value={task.end}
          leftCols={leftCols}
          rightCols={rightCols}
          onTypeChange={(endType, end) => onUpdate(task.id, { endType, end })}
          onChange={(end) => onUpdate(task.id, { end })}
          defaultSpecial="right-0"
          defaultDate={formatDate(new Date(viewStart))}
          optionPrefix="e"
        />
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400">カラー</label>
          <div
            className="grid grid-cols-4 gap-2"
            role="radiogroup"
            aria-label="タスクカラー"
          >
            {COLORS.map((c) => (
              <button
                key={c.bg}
                onClick={() => onUpdate(task.id, { color: c.bg })}
                className={`h-8 rounded ${c.bg} ${task.color === c.bg ? 'ring-2 ring-slate-400' : ''}`}
                role="radio"
                aria-checked={task.color === c.bg}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400">
            工程カテゴリ
          </label>
          <select
            value={task.category}
            onChange={(e) => onUpdate(task.id, { category: e.target.value })}
            className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="pt-4 border-t">
          <button
            onClick={() => onDelete(task.id)}
            className="w-full py-2 text-rose-500 text-xs font-bold border border-rose-100 rounded hover:bg-rose-50 flex items-center justify-center space-x-1"
          >
            <Trash2 size={14} />
            <span>タスク削除</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DatePointSelector({
  label,
  type,
  value,
  leftCols,
  rightCols,
  onTypeChange,
  onChange,
  defaultSpecial,
  defaultDate,
  optionPrefix,
}: {
  label: string;
  type: 'date' | 'special';
  value: string;
  leftCols: string[];
  rightCols: string[];
  onTypeChange: (type: 'date' | 'special', value: string) => void;
  onChange: (value: string) => void;
  defaultSpecial: string;
  defaultDate: string;
  optionPrefix: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex rounded-md border border-slate-200 overflow-hidden">
        <button
          onClick={() => onTypeChange('special', defaultSpecial)}
          className={`flex-1 py-1 text-[10px] font-bold ${type === 'special' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}
        >
          固定列
        </button>
        <button
          onClick={() => onTypeChange('date', defaultDate)}
          className={`flex-1 py-1 text-[10px] font-bold ${type === 'date' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}
        >
          カレンダー
        </button>
      </div>
      {type === 'special' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1.5 border rounded text-xs"
        >
          {leftCols.map((c, i) => (
            <option key={`${optionPrefix}l-${i}`} value={`left-${i}`}>
              {c}
            </option>
          ))}
          {rightCols.map((c, i) => (
            <option key={`${optionPrefix}r-${i}`} value={`right-${i}`}>
              {c}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1.5 border rounded text-xs"
        />
      )}
    </div>
  );
}
