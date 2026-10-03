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
  TrendingUp,
  Type,
  Upload,
  X,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { PageHeading } from '../../components/trail/PageHeading';
import { TrailLayout } from '../../components/trail/TrailLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  CsvChart,
  type ReferenceAreaConfig,
  type ReferenceLineConfig,
} from './CsvChart';
import { CsvDataTable } from './CsvDataTable';
import { COLOR_PALETTES, getContrastTextColor } from './csvConstants';
import { type ParsedData, parseCSV } from './csvParser';

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

  return (
    <TrailLayout>
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeading
            title="CSV Graph Viewer"
            back={{ to: '/tools', label: 'Tools' }}
          />
          {fileName && (
            <button
              type="button"
              onClick={() => {
                setRawData([]);
                setFileName('');
                setReferenceLines([]);
                setReferenceAreas([]);
              }}
              className="tg-btn tg-btn-ghost"
            >
              <X className="size-4" aria-hidden="true" />
              リセット
            </button>
          )}
        </div>

        {/* ファイルアップロード */}
        {!rawData.length && (
          <section className="tg-panel p-6">
            <div
              className="group cursor-pointer border-2 border-dashed border-line p-12 text-center transition-colors hover:border-webbing"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <Upload
                  className="size-10 text-webbing transition-transform group-hover:scale-110"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-lg font-medium text-ink">
                    CSVファイルをドラッグ＆ドロップ
                  </p>
                  <p className="text-sm text-ink-muted">または</p>
                </div>
                <label className="tg-btn cursor-pointer">
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
          </section>
        )}

        {parseError && (
          <p className="border border-line bg-ground p-4 text-sm text-destructive">
            {parseError}
          </p>
        )}

        {/* メインダッシュボード */}
        {rawData.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* サイドバー */}
            <div className="space-y-6 lg:col-span-1">
              {/* 基本設定 */}
              <section className="tg-panel p-5">
                <h3 className="tg-label mb-4 flex items-center gap-2">
                  <Settings className="size-3.5" aria-hidden="true" />{' '}
                  グラフ設定
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="tg-label mb-1.5 block">
                      グラフの種類
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'bar' as const, icon: BarChart2, label: '棒' },
                        { id: 'line' as const, icon: TrendingUp, label: '線' },
                        { id: 'area' as const, icon: Activity, label: '面' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          aria-pressed={chartType === type.id}
                          onClick={() => setChartType(type.id)}
                          className="tg-chip flex flex-1 items-center justify-center gap-1"
                        >
                          <type.icon className="size-3.5" aria-hidden="true" />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="tg-label mb-1.5 block">
                      X軸 (カテゴリ)
                    </label>
                    <select
                      value={xAxisKey}
                      onChange={(e) => setXAxisKey(e.target.value)}
                      className="w-full border border-line bg-ground p-2 text-sm focus:outline-none focus:ring-2 focus:ring-webbing"
                    >
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="tg-label mb-2 block">
                      Y軸 (データ列)
                    </label>
                    <div className="max-h-32 space-y-2 overflow-y-auto pr-1">
                      {headers.map((h) => (
                        <label
                          key={h}
                          className="flex cursor-pointer items-center gap-2 border border-transparent p-2 transition-colors hover:border-line hover:bg-ground"
                        >
                          <input
                            type="checkbox"
                            checked={dataKeys.includes(h)}
                            onChange={() => toggleDataKey(h)}
                            className="size-4 accent-[var(--tg-webbing)]"
                          />
                          <span className="truncate text-sm text-ink">{h}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* デザイン設定 */}
              <section className="tg-panel p-5">
                <h3 className="tg-label mb-4 flex items-center gap-2">
                  <Palette className="size-3.5" aria-hidden="true" />{' '}
                  デザイン設定
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="tg-label mb-1.5 block">
                      カラーテーマ
                    </label>
                    <select
                      value={colorTheme}
                      onChange={(e) => setColorTheme(e.target.value)}
                      className="mb-2 w-full border border-line bg-ground p-2 text-xs"
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
                          className="size-8 cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-ink-muted">
                          メインカラーを選択
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="tg-label mb-1.5 block">背景色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="size-8 cursor-pointer border-0 p-0"
                      />
                      <span className="text-xs text-ink-muted">背景を変更</span>
                    </div>
                  </div>

                  <div className="border-t border-line pt-2">
                    <label className="mt-2 flex cursor-pointer items-center gap-2">
                      <span
                        className={`relative block h-5 w-9 border border-ink transition-colors ${showDataLabels ? 'bg-ink' : 'bg-line'}`}
                      >
                        <input
                          type="checkbox"
                          checked={showDataLabels}
                          onChange={() => setShowDataLabels(!showDataLabels)}
                          className="hidden"
                        />
                        <span
                          className={`absolute top-0.5 size-3.5 transition-all ${showDataLabels ? 'left-5 bg-ground' : 'left-0.5 bg-surface'}`}
                        />
                      </span>
                      <span className="flex items-center gap-1 text-xs text-ink-muted">
                        <Type className="size-3" aria-hidden="true" />{' '}
                        データラベルを表示
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Reference Lines */}
              <section className="tg-panel p-5">
                <h3 className="tg-label mb-3">目標ライン追加</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="値"
                      value={newLineValue}
                      onChange={(e) => setNewLineValue(e.target.value)}
                      className="w-full border border-line bg-ground p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="ラベル"
                      value={newLineLabel}
                      onChange={(e) => setNewLineLabel(e.target.value)}
                      className="w-full border border-line bg-ground p-2 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addReferenceLine}
                    disabled={!newLineValue}
                    className="tg-btn tg-btn-ghost w-full justify-center text-xs disabled:opacity-50"
                  >
                    <Plus className="size-3" aria-hidden="true" /> 追加
                  </button>
                  {referenceLines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between border border-line bg-ground px-2 py-1 text-xs"
                    >
                      <span className="max-w-[120px] truncate text-ink-muted">
                        {line.label}: {line.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeReferenceLine(line.id)}
                        className="text-ink-muted transition-colors hover:text-destructive"
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Reference Areas */}
              <section className="tg-panel p-5">
                <h3 className="tg-label mb-3 flex items-center gap-2">
                  <ScanLine className="size-3" aria-hidden="true" />{' '}
                  エリア(帯)追加
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="開始"
                      value={newAreaStart}
                      onChange={(e) => setNewAreaStart(e.target.value)}
                      className="w-full border border-line bg-ground p-2 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="終了"
                      value={newAreaEnd}
                      onChange={(e) => setNewAreaEnd(e.target.value)}
                      className="w-full border border-line bg-ground p-2 text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="ラベル (任意)"
                    value={newAreaLabel}
                    onChange={(e) => setNewAreaLabel(e.target.value)}
                    className="w-full border border-line bg-ground p-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addReferenceArea}
                    disabled={newAreaStart === '' || newAreaEnd === ''}
                    className="tg-btn tg-btn-ghost w-full justify-center text-xs disabled:opacity-50"
                  >
                    <Plus className="size-3" aria-hidden="true" /> 追加
                  </button>
                  {referenceAreas.map((area) => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between border border-line bg-ground px-2 py-1 text-xs"
                    >
                      <span className="max-w-[120px] truncate text-ink-muted">
                        {area.label}: {area.y1}-{area.y2}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeReferenceArea(area.id)}
                        className="text-ink-muted transition-colors hover:text-destructive"
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setShowTable(!showTable)}
                  className="tg-btn tg-btn-ghost w-full justify-center text-sm"
                >
                  <TableIcon className="size-4" aria-hidden="true" />{' '}
                  {showTable ? 'グラフに戻る' : 'データ編集'}
                </button>
                <button
                  type="button"
                  onClick={downloadGraphImage}
                  className="tg-btn tg-btn-ghost w-full justify-center text-sm"
                >
                  <Download className="size-4" aria-hidden="true" /> 画像を保存
                </button>
              </div>
            </div>

            {/* メインエリア */}
            <div className="lg:col-span-3">
              <div
                className="tg-panel flex min-h-[500px] flex-col p-6"
                style={{ backgroundColor: bgColor }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2
                    className="flex items-center gap-2 text-lg font-bold"
                    style={{ color: textColor }}
                  >
                    <FileText
                      className="size-5"
                      style={{ color: currentColors[0] }}
                      aria-hidden="true"
                    />
                    {fileName}
                  </h2>
                  <span
                    className="px-3 py-1 text-xs opacity-80"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      color: textColor,
                    }}
                  >
                    {chartData.length} 行のデータ
                  </span>
                </div>

                <div className="min-h-[400px] w-full flex-1" ref={graphRef}>
                  {showTable ? (
                    <CsvDataTable
                      headers={headers}
                      rawData={rawData}
                      excludedRows={excludedRows}
                      onToggleRow={toggleRowExclusion}
                    />
                  ) : (
                    <CsvChart
                      chartType={chartType}
                      data={chartData}
                      xAxisKey={xAxisKey}
                      dataKeys={dataKeys}
                      colors={currentColors}
                      textColor={textColor}
                      showDataLabels={showDataLabels}
                      referenceLines={referenceLines}
                      referenceAreas={referenceAreas}
                    />
                  )}
                </div>

                {!showTable && dataKeys.length === 0 && (
                  <p
                    className="mt-4 text-center text-sm"
                    style={{ color: textColor }}
                  >
                    ←
                    左側のメニューから表示したいデータ（Y軸）を選択してください
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TrailLayout>
  );
}
