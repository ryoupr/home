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
    <div className="z-30 flex w-72 flex-col border-l-[1.5px] border-ink bg-surface">
      <div className="flex items-center justify-between border-b border-line bg-ground p-4 text-sm font-bold text-ink">
        <div className="flex items-center space-x-2">
          <Edit2 size={14} />
          <span>タスク詳細</span>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="space-y-5 overflow-y-auto p-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            タスク名
          </label>
          <input
            type="text"
            value={task.title}
            onChange={(e) => onUpdate(task.id, { title: e.target.value })}
            className="w-full border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-webbing"
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
          <label className="text-[10px] font-bold text-ink-muted">カラー</label>
          <div
            className="grid grid-cols-4 gap-2"
            role="radiogroup"
            aria-label="タスクカラー"
          >
            {COLORS.map((c) => (
              <button
                key={c.bg}
                onClick={() => onUpdate(task.id, { color: c.bg })}
                className={`h-8 ${c.bg} ${task.color === c.bg ? 'ring-2 ring-webbing ring-offset-2 ring-offset-surface' : ''}`}
                role="radio"
                aria-checked={task.color === c.bg}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-ink-muted">
            工程カテゴリ
          </label>
          <select
            value={task.category}
            onChange={(e) => onUpdate(task.id, { category: e.target.value })}
            className="w-full border border-line bg-surface px-2 py-1.5 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="border-t border-line pt-4">
          <button
            onClick={() => onDelete(task.id)}
            className="flex w-full items-center justify-center space-x-1 border border-line py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
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
      <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
        {label}
      </label>
      <div className="flex overflow-hidden border border-line">
        <button
          onClick={() => onTypeChange('special', defaultSpecial)}
          className={`flex-1 py-1 text-[10px] font-bold ${type === 'special' ? 'bg-ink text-ground' : 'bg-surface text-ink-muted'}`}
        >
          固定列
        </button>
        <button
          onClick={() => onTypeChange('date', defaultDate)}
          className={`flex-1 py-1 text-[10px] font-bold ${type === 'date' ? 'bg-ink text-ground' : 'bg-surface text-ink-muted'}`}
        >
          カレンダー
        </button>
      </div>
      {type === 'special' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-line bg-surface p-1.5 text-xs"
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
          className="w-full border border-line bg-surface p-1.5 text-xs"
        />
      )}
    </div>
  );
}
