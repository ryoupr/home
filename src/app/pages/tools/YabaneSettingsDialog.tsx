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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="設定"
    >
      <div className="tg-panel w-96 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-ground p-4 text-sm font-bold">
          設定
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[80vh] space-y-6 overflow-y-auto p-4">
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
          <div className="space-y-3 border-t border-line pt-4">
            <label className="flex cursor-pointer items-center space-x-3">
              <input
                type="checkbox"
                checked={useJapaneseHolidays}
                onChange={(e) => onHolidaysChange(e.target.checked)}
                className="accent-[var(--tg-webbing)]"
              />
              <span className="text-sm font-medium">日本の祝日を考慮する</span>
            </label>
            <div className="flex justify-between text-xs font-bold text-ink-muted">
              <span>1マスの幅</span>
              <span>{unitWidth}px</span>
            </div>
            <input
              type="range"
              min="30"
              max="250"
              value={unitWidth}
              onChange={(e) => onUnitWidthChange(Number(e.target.value))}
              className="w-full accent-[var(--tg-webbing)]"
            />
          </div>
        </div>
        <div className="flex justify-end border-t border-line bg-ground p-4">
          <button onClick={onClose} className="tg-btn">
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
      <label className="text-xs font-bold uppercase text-ink-muted">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {cols.map((c, i) => (
          <div
            key={i}
            className="flex items-center border border-line bg-ground px-2 py-1 text-xs font-bold text-ink"
          >
            <span>{c}</span>
            <button
              onClick={() => onChange(cols.filter((_, idx) => idx !== i))}
              className="ml-2 text-ink-muted hover:text-destructive"
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
          className="border border-line p-1 text-webbing hover:bg-ground"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
