/**
 * CSV parser extracted from CsvGraphViewerPage.
 * Handles quoted CSV fields and returns typed data.
 */

export interface ParsedData {
  _id: number;
  [key: string]: string | number;
}

export interface ParseResult {
  headers: string[];
  data: ParsedData[];
  error?: string;
}

/** Sanitize cell value to prevent CSV formula injection */
function sanitizeCell(val: string): string {
  if (/^[=+\-@\t\r]/.test(val)) return `'${val}`;
  return val;
}

export const parseCSV = (text: string): ParseResult => {
  if (!text || !text.trim())
    return { headers: [], data: [], error: 'ファイルが空です。' };

  const lines = text.split('\n').filter((line) => line.trim() !== '');
  if (lines.length === 0)
    return { headers: [], data: [], error: 'データ行がありません。' };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let start = 0;
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        let val = line.substring(start, i);
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        result.push(val.trim());
        start = i + 1;
      }
    }

    let lastVal = line.substring(start);
    if (lastVal.startsWith('"') && lastVal.endsWith('"')) {
      lastVal = lastVal.slice(1, -1);
    }
    result.push(lastVal.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const data = lines.slice(1).map((line, index) => {
    const values = parseLine(line);
    const obj: ParsedData = { _id: index };
    headers.forEach((header, i) => {
      const raw = sanitizeCell(values[i] ?? '');
      const num = parseFloat(raw);
      obj[header] = isNaN(num) ? raw : num;
    });
    return obj;
  });

  return { headers, data };
};
