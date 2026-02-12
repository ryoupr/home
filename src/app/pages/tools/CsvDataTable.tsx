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
    <div className="overflow-x-auto bg-white rounded-lg p-4">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 w-10">表示</th>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rawData.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                excludedRows.has(row._id) ? 'bg-slate-50 opacity-50' : ''
              }`}
            >
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={!excludedRows.has(row._id)}
                  onChange={() => onToggleRow(row._id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </td>
              {headers.map((h, j) => (
                <td
                  key={j}
                  className="px-4 py-3 whitespace-nowrap font-mono text-xs"
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
