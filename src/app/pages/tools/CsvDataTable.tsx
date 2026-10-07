/** Data table component for CsvGraphViewer. */

import type { ParsedData } from './csvParser';

interface CsvDataTableProps {
  headers: string[];
  rawData: ParsedData[];
  excludedRows: Set<number>;
  onToggleRow: (id: number) => void;
}

export function CsvDataTable({
  headers,
  rawData,
  excludedRows,
  onToggleRow,
}: CsvDataTableProps) {
  return (
    <div className="overflow-x-auto border border-line bg-surface p-4">
      <table className="w-full text-left text-sm text-ink-muted">
        <thead className="border-b border-line bg-ground text-xs uppercase text-ink">
          <tr>
            <th className="w-10 px-4 py-3">表示</th>
            {headers.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rawData.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-line transition-colors hover:bg-ground ${
                excludedRows.has(row._id) ? 'bg-ground opacity-50' : ''
              }`}
            >
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={!excludedRows.has(row._id)}
                  onChange={() => onToggleRow(row._id)}
                  className="size-4 cursor-pointer accent-[var(--tg-webbing)]"
                />
              </td>
              {headers.map((h, j) => (
                <td
                  key={j}
                  className="whitespace-nowrap px-4 py-3 font-mono text-xs"
                >
                  {row[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
