import type { ParsedData } from './types';

export const parseCSV = (text: string): { headers: string[]; data: ParsedData[] } => {
  try {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return { headers: [], data: [] };

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let start = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') inQuotes = !inQuotes;
        else if (line[i] === ',' && !inQuotes) {
          let val = line.substring(start, i);
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          result.push(val.trim());
          start = i + 1;
        }
      }
      let lastVal = line.substring(start);
      if (lastVal.startsWith('"') && lastVal.endsWith('"')) lastVal = lastVal.slice(1, -1);
      result.push(lastVal.trim());
      return result;
    };

    const headers = parseLine(lines[0] ?? '');
    if (headers.length === 0) return { headers: [], data: [] };

    const data = lines.slice(1).map((line, index) => {
      const values = parseLine(line);
      const obj: ParsedData = { _id: index };
      headers.forEach((header, i) => {
        const val = values[i] ?? '';
        const num = parseFloat(val);
        obj[header] = isNaN(num) ? val : num;
      });
      return obj;
    });

    return { headers, data };
  } catch (e) {
    console.error('CSV parse error:', e);
    return { headers: [], data: [] };
  }
};

export const getContrastTextColor = (hexColor: string): string => {
  if (!hexColor || !/^#[0-9a-fA-F]{6}$/.test(hexColor)) return '#1e293b';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#1e293b' : '#f8fafc';
};
