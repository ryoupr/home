import { Plus, X } from 'lucide-react';

interface Props {
  leftCols: string[];
  rightCols: string[];
  unitWidth: number;
  useJapaneseHolidays: boolean;
  onLeftColsChange: (cols: string[]) => void;
  onRightColsChange: (cols: string[]) => void;
  onUnitWidthChange: (width: number) => void;
  onHolidaysChange: (use: boolean) => void;
  onClose: () => void;
}

export function YabaneSettingsDialog({
  leftCols,
  rightCols,
  unitWidth,
  useJapaneseHolidays,
  onLeftColsChange,
  onRightColsChange,
  onUnitWidthChange,
  onHolidaysChange,
  onClose,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="設定"
    >
      <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 font-bold text-sm">
          設定
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto max-h-[80vh]">
          <ColumnEditor
            label="固定列（左側）"
            cols={leftCols}
            onChange={onLeftColsChange}
          />
          <ColumnEditor
            label="固定列（右側）"
            cols={rightCols}
            onChange={onRightColsChange}
          />
          <div className="space-y-3 pt-4 border-t">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useJapaneseHolidays}
                onChange={(e) => onHolidaysChange(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="text-sm font-medium">日本の祝日を考慮する</span>
            </label>
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>1マスの幅</span>
              <span>{unitWidth}px</span>
            </div>
            <input
              type="range"
              min="30"
              max="250"
              value={unitWidth}
              onChange={(e) => onUnitWidthChange(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

function ColumnEditor({
  label,
  cols,
  onChange,
}: {
  label: string;
  cols: string[];
  onChange: (cols: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-slate-500 uppercase">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {cols.map((c, i) => (
          <div
            key={i}
            className="flex items-center bg-slate-100 rounded px-2 py-1 text-xs font-bold text-slate-600"
          >
            <span>{c}</span>
            <button
              onClick={() => onChange(cols.filter((_, idx) => idx !== i))}
              className="ml-2 text-slate-400 hover:text-rose-500"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const n = window.prompt?.('列名')?.trim().slice(0, 50);
            if (n) onChange([...cols, n]);
          }}
          className="text-indigo-600 p-1 border border-indigo-200 rounded hover:bg-indigo-50"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
