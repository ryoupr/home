import {
  Activity,
  BarChart2,
  Download,
  FileText,
  Palette,
  Plus,
  ScanLine,
  Settings,
  Table as TableIcon,
  Trash2,
  TrendingUp,
  Type,
  Upload,
  X,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePageTitle } from '../../hooks/usePageTitle';
import { type ParsedData, parseCSV } from './csvParser';

// 型定義
interface ReferenceLineConfig {
  id: number;
  value: number;
  label: string;
  color: string;
}

interface ReferenceAreaConfig {
  id: number;
  y1: number;
  y2: number;
  label: string;
  color: string;
}

// 色の輝度を判定してテキスト色（黒/白）を返す関数
const getContrastTextColor = (hexColor: string): string => {
  if (!hexColor) return '#1e293b';
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#1e293b' : '#f8fafc';
};

// プリセットパレット定義
const COLOR_PALETTES: Record<string, string[]> = {
  default: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  cool: ['#2563EB', '#0EA5E9', '#06B6D4', '#14B8A6', '#6366F1', '#8B5CF6'],
  warm: ['#DC2626', '#EA580C', '#D97706', '#CA8A04', '#BE123C', '#9F1239'],
  pastel: ['#FDA4AF', '#FDBA74', '#FDE047', '#86EFAC', '#67E8F9', '#C4B5FD'],
  monochrome: [
    '#334155',
    '#475569',
    '#64748b',
    '#94a3b8',
    '#cbd5e1',
    '#e2e8f0',
  ],
};

export function CsvGraphViewerPage() {
  usePageTitle('CSV Graph Viewer');
  const [rawData, setRawData] = useState<ParsedData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [xAxisKey, setXAxisKey] = useState('');
  const [dataKeys, setDataKeys] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [showTable, setShowTable] = useState(false);
  const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set());

  // デザイン設定
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [colorTheme, setColorTheme] = useState('default');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#4F46E5');
  const [referenceLines, setReferenceLines] = useState<ReferenceLineConfig[]>(
    []
  );
  const [newLineValue, setNewLineValue] = useState('');
  const [newLineLabel, setNewLineLabel] = useState('');
  const [referenceAreas, setReferenceAreas] = useState<ReferenceAreaConfig[]>(
    []
  );
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
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const {
        headers: parsedHeaders,
        data: parsedData,
        error,
      } = parseCSV(text);
      if (error) {
        setParseError(error);
        return;
      }
      setParseError('');
      setHeaders(parsedHeaders);
      setRawData(parsedData);
      setExcludedRows(new Set());
      if (parsedHeaders.length >= 2) {
        setXAxisKey(parsedHeaders[0]);
        setDataKeys([parsedHeaders[parsedHeaders.length - 1]]);
      }
    };
    reader.onerror = () => {
      setParseError('ファイルの読み込みに失敗しました。');
    };
    reader.readAsText(file);
  };

  const toggleDataKey = (key: string) => {
    setDataKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleRowExclusion = (id: number) => {
    const newSet = new Set(excludedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExcludedRows(newSet);
  };

  const addReferenceLine = () => {
    if (!newLineValue) return;
    const newLine: ReferenceLineConfig = {
      id: Date.now(),
      value: parseFloat(newLineValue),
      label: newLineLabel || `Ref ${parseFloat(newLineValue)}`,
      color: '#ef4444',
    };
    setReferenceLines([...referenceLines, newLine]);
    setNewLineValue('');
    setNewLineLabel('');
  };

  const removeReferenceLine = (id: number) => {
    setReferenceLines(referenceLines.filter((line) => line.id !== id));
  };

  const addReferenceArea = () => {
    if (newAreaStart === '' || newAreaEnd === '') return;
    const start = parseFloat(newAreaStart);
    const end = parseFloat(newAreaEnd);
    if (isNaN(start) || isNaN(end)) return;
    const newArea: ReferenceAreaConfig = {
      id: Date.now(),
      y1: Math.min(start, end),
      y2: Math.max(start, end),
      label: newAreaLabel || 'Zone',
      color: '#fcd34d',
    };
    setReferenceAreas([...referenceAreas, newArea]);
    setNewAreaStart('');
    setNewAreaEnd('');
    setNewAreaLabel('');
  };

  const removeReferenceArea = (id: number) => {
    setReferenceAreas(referenceAreas.filter((area) => area.id !== id));
  };

  const chartData = useMemo(() => {
    return rawData.filter((row) => !excludedRows.has(row._id));
  }, [rawData, excludedRows]);

  const currentColors = useMemo(() => {
    if (colorTheme === 'custom') {
      return [customPrimaryColor, '#94a3b8', '#cbd5e1', '#475569'];
    }
    return COLOR_PALETTES[colorTheme] || COLOR_PALETTES.default;
  }, [colorTheme, customPrimaryColor]);

  const textColor = useMemo(() => getContrastTextColor(bgColor), [bgColor]);

  const downloadGraphImage = () => {
    if (!graphRef.current) return;
    const svgElement = graphRef.current.querySelector('svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
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
      ctx.drawImage(
        image,
        0,
        0,
        svgElement.clientWidth,
        svgElement.clientHeight
      );

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${fileName || 'graph'}_chart.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const renderReferenceLines = () =>
    referenceLines.map((line) => (
      <ReferenceLine
        key={line.id}
        y={line.value}
        label={{
          position: 'right',
          value: line.label,
          fill: line.color,
          fontSize: 12,
          fontWeight: 'bold',
        }}
        stroke={line.color}
        strokeDasharray="3 3"
        strokeWidth={2}
      />
    ));

  const renderReferenceAreas = () =>
    referenceAreas.map((area) => (
      <ReferenceArea
        key={area.id}
        y1={area.y1}
        y2={area.y2}
        label={{
          position: 'insideTopRight',
          value: area.label,
          fill: '#92400e',
          fontSize: 12,
          fontWeight: 'bold',
        }}
        fill={area.color}
        fillOpacity={0.2}
        strokeOpacity={0}
      />
    ));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/tools"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← ツール一覧
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                CSV Graph Viewer
              </h1>
            </div>
          </div>
          {fileName && (
            <button
              onClick={() => {
                setRawData([]);
                setFileName('');
                setReferenceLines([]);
                setReferenceAreas([]);
              }}
              className="text-sm text-slate-500 hover:text-red-500 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              リセット
            </button>
          )}
        </header>

        {/* ファイルアップロード */}
        {!rawData.length && (
          <div
            className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer group shadow-sm"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-slate-700">
                  CSVファイルをドラッグ＆ドロップ
                </p>
                <p className="text-sm text-slate-400">または</p>
              </div>
              <label className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer font-medium shadow-md hover:shadow-lg">
                ファイルを選択
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        )}

        {parseError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {parseError}
          </div>
        )}

        {/* メインダッシュボード */}
        {rawData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* サイドバー */}
            <div className="lg:col-span-1 space-y-6">
              {/* 基本設定 */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" /> グラフ設定
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      グラフの種類
                    </label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      {[
                        { id: 'bar' as const, icon: BarChart2, label: '棒' },
                        { id: 'line' as const, icon: TrendingUp, label: '線' },
                        { id: 'area' as const, icon: Activity, label: '面' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setChartType(type.id)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded-md transition-all ${
                            chartType === type.id
                              ? 'bg-white text-indigo-600 shadow-sm font-medium'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <type.icon className="w-3.5 h-3.5" />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      X軸 (カテゴリ)
                    </label>
                    <select
                      value={xAxisKey}
                      onChange={(e) => setXAxisKey(e.target.value)}
                      className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-2 block">
                      Y軸 (データ列)
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {headers.map((h) => (
                        <label
                          key={h}
                          className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={dataKeys.includes(h)}
                            onChange={() => toggleDataKey(h)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700 truncate">
                            {h}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* デザイン設定 */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" /> デザイン設定
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      カラーテーマ
                    </label>
                    <select
                      value={colorTheme}
                      onChange={(e) => setColorTheme(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-2"
                    >
                      <option value="default">デフォルト (インディゴ)</option>
                      <option value="cool">寒色系 (ブルー・シアン)</option>
                      <option value="warm">暖色系 (レッド・オレンジ)</option>
                      <option value="pastel">パステル</option>
                      <option value="monochrome">モノクロ</option>
                      <option value="custom">カスタムカラー</option>
                    </select>
                    {colorTheme === 'custom' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customPrimaryColor}
                          onChange={(e) =>
                            setCustomPrimaryColor(e.target.value)
                          }
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <span className="text-xs text-slate-600">
                          メインカラーを選択
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      背景色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm"
                      />
                      <span className="text-xs text-slate-600">背景を変更</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <div
                        className={`w-9 h-5 rounded-full relative transition-colors ${showDataLabels ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <input
                          type="checkbox"
                          checked={showDataLabels}
                          onChange={() => setShowDataLabels(!showDataLabels)}
                          className="hidden"
                        />
                        <div
                          className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showDataLabels ? 'left-5' : 'left-0.5'}`}
                        />
                      </div>
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Type className="w-3 h-3" /> データラベルを表示
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Reference Lines */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  目標ライン追加
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="値"
                      value={newLineValue}
                      onChange={(e) => setNewLineValue(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="ラベル"
                      value={newLineLabel}
                      onChange={(e) => setNewLineLabel(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <button
                    onClick={addReferenceLine}
                    disabled={!newLineValue}
                    className="w-full py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" /> 追加
                  </button>
                  {referenceLines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs"
                    >
                      <span className="text-slate-600 truncate max-w-[120px]">
                        {line.label}: {line.value}
                      </span>
                      <button
                        onClick={() => removeReferenceLine(line.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference Areas */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ScanLine className="w-3 h-3" /> エリア(帯)追加
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="開始"
                      value={newAreaStart}
                      onChange={(e) => setNewAreaStart(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="終了"
                      value={newAreaEnd}
                      onChange={(e) => setNewAreaEnd(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="ラベル (任意)"
                    value={newAreaLabel}
                    onChange={(e) => setNewAreaLabel(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    onClick={addReferenceArea}
                    disabled={newAreaStart === '' || newAreaEnd === ''}
                    className="w-full py-1.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-lg hover:bg-amber-100 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" /> 追加
                  </button>
                  {referenceAreas.map((area) => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs"
                    >
                      <span className="text-slate-600 truncate max-w-[120px]">
                        {area.label}: {area.y1}-{area.y2}
                      </span>
                      <button
                        onClick={() => removeReferenceArea(area.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm border border-slate-100 text-sm"
                >
                  <TableIcon className="w-4 h-4" />{' '}
                  {showTable ? 'グラフに戻る' : 'データ編集'}
                </button>
                <button
                  onClick={downloadGraphImage}
                  className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm border border-slate-100 text-sm"
                >
                  <Download className="w-4 h-4" /> 画像を保存
                </button>
              </div>
            </div>

            {/* メインエリア */}
            <div className="lg:col-span-3">
              <div
                className="p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col transition-colors"
                style={{ backgroundColor: bgColor }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className="text-lg font-bold flex items-center gap-2"
                    style={{ color: textColor }}
                  >
                    <FileText
                      className="w-5 h-5"
                      style={{ color: currentColors[0] }}
                    />
                    {fileName}
                  </h2>
                  <div
                    className="text-xs px-3 py-1 rounded-full opacity-80"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      color: textColor,
                    }}
                  >
                    {chartData.length} 行のデータ
                  </div>
                </div>

                <div className="flex-1 w-full min-h-[400px]" ref={graphRef}>
                  {showTable ? (
                    <div className="overflow-x-auto bg-white rounded-lg p-4">
                      <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 w-10">表示</th>
                            {headers.map((h, i) => (
                              <th
                                key={i}
                                className="px-4 py-3 font-semibold whitespace-nowrap"
                              >
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
                                excludedRows.has(row._id)
                                  ? 'bg-slate-50 opacity-50'
                                  : ''
                              }`}
                            >
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={!excludedRows.has(row._id)}
                                  onChange={() => toggleRowExclusion(row._id)}
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
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minHeight={400}
                    >
                      {chartType === 'bar' && (
                        <BarChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={textColor}
                            strokeOpacity={0.2}
                          />
                          <XAxis
                            dataKey={xAxisKey}
                            stroke={textColor}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke={textColor}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString()}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              color: '#1e293b',
                            }}
                            formatter={(value) =>
                              (value as number).toLocaleString()
                            }
                          />
                          <Legend wrapperStyle={{ color: textColor }} />
                          {dataKeys.map((key, index) => (
                            <Bar
                              key={key}
                              dataKey={key}
                              fill={currentColors[index % currentColors.length]}
                              radius={[4, 4, 0, 0]}
                            >
                              {showDataLabels && (
                                <LabelList
                                  dataKey={key}
                                  position="top"
                                  fill={textColor}
                                  fontSize={10}
                                />
                              )}
                            </Bar>
                          ))}
                          {renderReferenceAreas()}
                          {renderReferenceLines()}
                        </BarChart>
                      )}

                      {chartType === 'line' && (
                        <LineChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={textColor}
                            strokeOpacity={0.2}
                          />
                          <XAxis
                            dataKey={xAxisKey}
                            stroke={textColor}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke={textColor}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString()}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              color: '#1e293b',
                            }}
                            formatter={(value) =>
                              (value as number).toLocaleString()
                            }
                          />
                          <Legend wrapperStyle={{ color: textColor }} />
                          {dataKeys.map((key, index) => (
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={
                                currentColors[index % currentColors.length]
                              }
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            >
                              {showDataLabels && (
                                <LabelList
                                  dataKey={key}
                                  position="top"
                                  fill={textColor}
                                  fontSize={10}
                                  offset={10}
                                />
                              )}
                            </Line>
                          ))}
                          {renderReferenceAreas()}
                          {renderReferenceLines()}
                        </LineChart>
                      )}

                      {chartType === 'area' && (
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={textColor}
                            strokeOpacity={0.2}
                          />
                          <XAxis
                            dataKey={xAxisKey}
                            stroke={textColor}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke={textColor}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString()}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              color: '#1e293b',
                            }}
                            formatter={(value) =>
                              (value as number).toLocaleString()
                            }
                          />
                          <Legend wrapperStyle={{ color: textColor }} />
                          {dataKeys.map((key, index) => (
                            <Area
                              key={key}
                              type="monotone"
                              dataKey={key}
                              fill={currentColors[index % currentColors.length]}
                              stroke={
                                currentColors[index % currentColors.length]
                              }
                              fillOpacity={0.2}
                            >
                              {showDataLabels && (
                                <LabelList
                                  dataKey={key}
                                  position="top"
                                  fill={textColor}
                                  fontSize={10}
                                />
                              )}
                            </Area>
                          ))}
                          {renderReferenceAreas()}
                          {renderReferenceLines()}
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </div>

                {!showTable && dataKeys.length === 0 && (
                  <div className="text-center text-slate-400 mt-4 text-sm">
                    ←
                    左側のメニューから表示したいデータ（Y軸）を選択してください
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
