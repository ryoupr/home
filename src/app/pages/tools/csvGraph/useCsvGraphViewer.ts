import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ParsedData, ReferenceLine, ReferenceArea } from './types';
import { COLOR_PALETTES } from './types';
import { parseCSV, getContrastTextColor } from './utils';

export function useCsvGraphViewer() {
  useEffect(() => { document.title = 'CSV Graph Viewer | ryoupr'; }, []);

  const [rawData, setRawData] = useState<ParsedData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [xAxisKey, setXAxisKey] = useState('');
  const [dataKeys, setDataKeys] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [showTable, setShowTable] = useState(false);
  const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set());
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [colorTheme, setColorTheme] = useState('default');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#4F46E5');
  const [referenceLines, setReferenceLines] = useState<ReferenceLine[]>([]);
  const [newLineValue, setNewLineValue] = useState('');
  const [newLineLabel, setNewLineLabel] = useState('');
  const [referenceAreas, setReferenceAreas] = useState<ReferenceArea[]>([]);
  const [newAreaStart, setNewAreaStart] = useState('');
  const [newAreaEnd, setNewAreaEnd] = useState('');
  const [newAreaLabel, setNewAreaLabel] = useState('');

  const graphRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file) return;
    const allowedTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) return;
    if (file.size > 50 * 1024 * 1024) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: parsedHeaders, data: parsedData } = parseCSV(text);
      setHeaders(parsedHeaders);
      setRawData(parsedData);
      setExcludedRows(new Set());
      if (parsedHeaders.length >= 2) {
        setXAxisKey(parsedHeaders[0]!);
        setDataKeys([parsedHeaders[parsedHeaders.length - 1]!]);
      }
    };
    reader.onerror = () => console.error('FileReader error:', reader.error);
    reader.readAsText(file);
  };

  const toggleDataKey = (key: string) => {
    setDataKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleRowExclusion = (id: number) => {
    const newSet = new Set(excludedRows);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExcludedRows(newSet);
  };

  const addReferenceLine = () => {
    if (!newLineValue) return;
    setReferenceLines([...referenceLines, { id: Date.now(), value: parseFloat(newLineValue), label: newLineLabel || `Ref ${parseFloat(newLineValue)}`, color: '#ef4444' }]);
    setNewLineValue(''); setNewLineLabel('');
  };

  const removeReferenceLine = (id: number) => setReferenceLines(referenceLines.filter(l => l.id !== id));

  const addReferenceArea = () => {
    if (newAreaStart === '' || newAreaEnd === '') return;
    const start = parseFloat(newAreaStart), end = parseFloat(newAreaEnd);
    if (isNaN(start) || isNaN(end)) return;
    setReferenceAreas([...referenceAreas, { id: Date.now(), y1: Math.min(start, end), y2: Math.max(start, end), label: newAreaLabel || 'Zone', color: '#fcd34d' }]);
    setNewAreaStart(''); setNewAreaEnd(''); setNewAreaLabel('');
  };

  const removeReferenceArea = (id: number) => setReferenceAreas(referenceAreas.filter(a => a.id !== id));

  const chartData = useMemo(() => rawData.filter(row => !excludedRows.has(row._id)), [rawData, excludedRows]);

  const currentColors: string[] = useMemo(() => {
    if (colorTheme === 'custom') return [customPrimaryColor, "#94a3b8", "#cbd5e1", "#475569"];
    return COLOR_PALETTES[colorTheme] ?? COLOR_PALETTES.default ?? [];
  }, [colorTheme, customPrimaryColor]);

  const textColor = useMemo(() => getContrastTextColor(bgColor), [bgColor]);

  const downloadGraphImage = () => {
    if (!graphRef.current) return;
    const svgElement = graphRef.current.querySelector('svg');
    if (!svgElement) return;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    if (!svgString) return;
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = svgElement.clientWidth * scale;
      canvas.height = svgElement.clientHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, svgElement.clientWidth, svgElement.clientHeight);
      ctx.drawImage(image, 0, 0, svgElement.clientWidth, svgElement.clientHeight);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl; link.download = `${fileName || 'graph'}_chart.png`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const resetAll = () => {
    setRawData([]); setFileName(''); setReferenceLines([]); setReferenceAreas([]);
  };

  return {
    rawData, headers, fileName, xAxisKey, dataKeys, chartType, showTable, excludedRows,
    showDataLabels, bgColor, colorTheme, customPrimaryColor,
    referenceLines, newLineValue, newLineLabel,
    referenceAreas, newAreaStart, newAreaEnd, newAreaLabel,
    graphRef, chartData, currentColors, textColor,
    setXAxisKey, setChartType, setShowTable, setShowDataLabels,
    setBgColor, setColorTheme, setCustomPrimaryColor,
    setNewLineValue, setNewLineLabel, setNewAreaStart, setNewAreaEnd, setNewAreaLabel,
    handleFileUpload, handleDrop, toggleDataKey, toggleRowExclusion,
    addReferenceLine, removeReferenceLine, addReferenceArea, removeReferenceArea,
    downloadGraphImage, resetAll,
  };
}
