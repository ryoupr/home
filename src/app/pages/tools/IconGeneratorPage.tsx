import {
  Box,
  ChevronDown,
  Download,
  FolderOpen,
  Image as ImageIconLucide,
  Palette,
  Redo2,
  RotateCcw,
  Save as SaveIcon,
  Smile,
  Type,
  Undo2,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrailLayout } from '../../components/trail/TrailLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  CANVAS_SIZE,
  GRADIENT_COLORS,
  GRADIENTS,
} from './iconGeneratorConstants';
import {
  createCanvas,
  defaultConfig,
  downloadCanvas,
  downloadSVG,
  drawBackground,
  drawIcon,
  drawText,
  drawUploadedImage,
  exportMultipleSizes,
  IconConfig,
} from './iconGeneratorHelpers';
import { useLocalStorage, useUndoRedo } from './iconGeneratorHooks';
import { iconKeys, iconMap } from './iconMap';

export default function IconGeneratorPage() {
  usePageTitle('Icon Generator');
  const {
    currentState: config,
    setState: setConfig,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<IconConfig>(defaultConfig);
  const [presets, setPresets] = useLocalStorage<IconConfig[]>(
    'icon-presets',
    []
  );
  // Core state managed by custom hooks (useUndoRedo, useLocalStorage).
  // Remaining useState hooks are minimal UI state (search, zoom, menu toggle).
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target as Node)
      ) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredIcons = useMemo(() => {
    if (!searchQuery) return iconKeys;
    return iconKeys.filter((key) =>
      key.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async () => {
    try {
      setDownloadError('');
      const [canvas, ctx] = createCanvas();
      drawBackground(ctx, config, CANVAS_SIZE);

      const previewElement = document.getElementById('preview-icon-container');
      if (!previewElement) return;

      if (config.type === 'icon') {
        const svgNode = previewElement.querySelector('svg');
        if (svgNode) {
          await drawIcon(ctx, svgNode, config, CANVAS_SIZE);
          downloadCanvas(canvas, 'icon.png');
        }
      } else if (config.type === 'text') {
        drawText(ctx, config, CANVAS_SIZE);
        downloadCanvas(canvas, 'icon.png');
      } else if (config.type === 'image' && config.uploadedImage) {
        await drawUploadedImage(ctx, config.uploadedImage, config, CANVAS_SIZE);
        downloadCanvas(canvas, 'icon.png');
      }
    } catch (err) {
      setDownloadError(
        `ダウンロードに失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`
      );
    }
  };

  const handleDownloadSVG = () => {
    try {
      const previewElement = document.getElementById('preview-icon-container');
      const svgNode = previewElement?.querySelector('svg');
      if (config.type === 'icon' && svgNode) {
        downloadSVG(config, svgNode, 'icon.svg');
      }
    } catch (err) {
      setDownloadError(
        `SVGダウンロードに失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`
      );
    }
  };

  const handleExportMultiple = async () => {
    try {
      setDownloadError('');
      const previewElement = document.getElementById('preview-icon-container');
      await exportMultipleSizes(
        config,
        previewElement,
        [16, 32, 64, 128, 256, 512, 1024]
      );
    } catch (err) {
      setDownloadError(
        `一括エクスポートに失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`
      );
    }
  };

  const ALLOWED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'image/webp',
  ];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setDownloadError('対応形式: PNG, JPEG, GIF, SVG, WebP');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setDownloadError('ファイルサイズは5MB以下にしてください');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setConfig({ ...config, type: 'image', uploadedImage: imageUrl });
    };
    reader.readAsDataURL(file);
  };

  const savePreset = () => {
    setPresets([...presets, config]);
  };

  const loadPreset = (preset: IconConfig) => {
    setConfig(preset);
  };

  const SelectedIcon = iconMap[config.iconKey] || iconMap.Zap;

  return (
    <TrailLayout variant="app">
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 sm:px-6">
        {/* ツール固有のツールバー（SiteHeader の下。戻るリンクとタイトルはここ） */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b-[1.5px] border-ink pt-2 pb-3">
          <div className="flex items-center gap-4">
            <Link to="/tools" className="tg-nav-link tg-label hover:text-ink">
              ← Tools
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-webbing p-1.5 text-on-webbing">
                <Box size={20} />
              </div>
              <h1 className="tg-display text-xl">
                IconMaker<span className="text-webbing">.</span>
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="border border-line bg-surface p-2 text-ink transition-colors hover:bg-line disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
              aria-label="Undo last action"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="border border-line bg-surface p-2 text-ink transition-colors hover:bg-line disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
              aria-label="Redo last action"
            >
              <Redo2 size={18} />
            </button>
            <div className="relative" ref={downloadMenuRef}>
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="tg-btn"
                aria-label="Download menu"
              >
                <Download size={18} />
                <span>Download</span>
                <ChevronDown size={16} />
              </button>
              {showDownloadMenu && (
                <div className="absolute right-0 mt-2 z-20 w-48 border-[1.5px] border-ink bg-surface py-1">
                  <button
                    onClick={() => {
                      handleDownload();
                      setShowDownloadMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-ink transition-colors hover:bg-ground"
                  >
                    <Download size={16} />
                    PNG (1024x1024)
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadSVG();
                      setShowDownloadMenu(false);
                    }}
                    disabled={config.type !== 'icon'}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-ink transition-colors hover:bg-ground disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Download size={16} />
                    SVG (Vector)
                  </button>
                  <button
                    onClick={() => {
                      handleExportMultiple();
                      setShowDownloadMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-ink transition-colors hover:bg-ground"
                  >
                    <Download size={16} />
                    All Sizes
                  </button>
                </div>
              )}
            </div>
            {downloadError && (
              <p className="mt-1 text-xs text-red-500">{downloadError}</p>
            )}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto pt-6 lg:grid-cols-12 lg:grid-rows-1 lg:overflow-hidden">
          <div className="space-y-6 lg:col-span-4 lg:min-h-0 lg:overflow-y-auto lg:pb-2">
            <div className="tg-panel p-5">
              <h3 className="tg-label mb-4 flex items-center gap-2">
                <Type size={14} /> Content
              </h3>
              <div className="mb-4 flex gap-2 border border-line bg-ground p-1">
                <button
                  onClick={() => setConfig({ ...config, type: 'icon' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${config.type === 'icon' ? 'bg-ink text-ground' : 'text-ink-muted hover:text-ink'}`}
                  aria-label="Select icon mode"
                >
                  <Smile size={16} /> Icon
                </button>
                <button
                  onClick={() => setConfig({ ...config, type: 'text' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${config.type === 'text' ? 'bg-ink text-ground' : 'text-ink-muted hover:text-ink'}`}
                  aria-label="Select text mode"
                >
                  <Type size={16} /> Text
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${config.type === 'image' ? 'bg-ink text-ground' : 'text-ink-muted hover:text-ink'}`}
                  aria-label="Upload image"
                >
                  <ImageIconLucide size={16} /> Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload image file"
                />
              </div>

              {config.type === 'text' ? (
                <input
                  type="text"
                  value={config.text}
                  onChange={(e) =>
                    setConfig({ ...config, text: e.target.value })
                  }
                  className="w-full border border-line bg-surface px-4 py-3 text-center text-lg font-bold outline-none focus:border-webbing focus:ring-2 focus:ring-webbing"
                  placeholder="Type here..."
                  maxLength={4}
                  aria-label="Enter text for icon"
                />
              ) : config.type === 'icon' ? (
                <>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search icons..."
                    className="mb-3 w-full border border-line bg-surface px-4 py-2 text-sm outline-none focus:border-webbing focus:ring-2 focus:ring-webbing"
                    aria-label="Search for icons"
                  />
                  <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
                    {filteredIcons.map((key) => {
                      const IconComponent = iconMap[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setConfig({ ...config, iconKey: key })}
                          className={`flex items-center justify-center p-2 transition-colors ${config.iconKey === key ? 'bg-ink text-ground ring-2 ring-webbing ring-offset-1 ring-offset-surface' : 'text-ink-muted hover:bg-ground hover:text-ink'}`}
                          title={key}
                          aria-label={`Select ${key} icon`}
                        >
                          <IconComponent size={20} />
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-ink-muted">
                  {config.uploadedImage
                    ? 'Image uploaded'
                    : 'Click Image button to upload'}
                </div>
              )}
            </div>

            <div className="tg-panel p-5">
              <h3 className="tg-label mb-4 flex items-center gap-2">
                <Palette size={14} /> Style
              </h3>

              <div className="mb-6">
                <label className="tg-label mb-2 block" htmlFor="bg-color">
                  Background
                </label>
                <div className="flex gap-3 mb-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-line">
                    <input
                      id="bg-color"
                      type="color"
                      value={config.bgColor}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          bgColor: e.target.value,
                          gradient: 'none',
                        })
                      }
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      aria-label="Select background color"
                    />
                  </div>
                  <div className="flex-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {GRADIENTS.map((g) => (
                      <button
                        key={g.name}
                        onClick={() => {
                          if (g.value === 'none') {
                            setConfig({ ...config, gradient: 'none' });
                          } else {
                            const gradientName = g.value.match(
                              /Sunset|Ocean|Purple|Midnight|Cherry|Nature|Slick/
                            )?.[0];
                            const newBgColor =
                              gradientName && GRADIENT_COLORS[gradientName]
                                ? GRADIENT_COLORS[gradientName][0]
                                : config.bgColor;
                            setConfig({
                              ...config,
                              gradient: g.value,
                              bgColor: newBgColor,
                            });
                          }
                        }}
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-transform ${config.gradient === g.value ? 'scale-110 border-webbing' : 'border-transparent hover:scale-105'}`}
                        style={{
                          background:
                            g.value === 'none' ? config.bgColor : g.value,
                        }}
                        title={g.name}
                        aria-label={`Select ${g.name} gradient`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="tg-label mb-2 block" htmlFor="fg-color">
                  Icon / Text Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-line">
                    <input
                      id="fg-color"
                      type="color"
                      value={config.fgColor}
                      onChange={(e) =>
                        setConfig({ ...config, fgColor: e.target.value })
                      }
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      aria-label="Select foreground color"
                    />
                  </div>
                  <input
                    type="text"
                    value={config.fgColor}
                    onChange={(e) =>
                      setConfig({ ...config, fgColor: e.target.value })
                    }
                    className="flex-1 border border-line bg-surface px-3 py-2 text-sm uppercase"
                    aria-label="Foreground color hex value"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="size-slider" className="tg-label">
                      Size
                    </label>
                    <span className="text-xs text-ink-muted">
                      {config.size}%
                    </span>
                  </div>
                  <input
                    id="size-slider"
                    type="range"
                    min="20"
                    max="90"
                    value={config.size}
                    onChange={(e) =>
                      setConfig({ ...config, size: parseInt(e.target.value) })
                    }
                    className="h-2 w-full cursor-pointer appearance-none bg-line accent-[var(--tg-webbing)]"
                    aria-label="Adjust icon size"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="radius-slider" className="tg-label">
                      Corner Radius
                    </label>
                    <span className="text-xs text-ink-muted">
                      {config.radius}%
                    </span>
                  </div>
                  <input
                    id="radius-slider"
                    type="range"
                    min="0"
                    max="50"
                    value={config.radius}
                    onChange={(e) =>
                      setConfig({ ...config, radius: parseInt(e.target.value) })
                    }
                    className="h-2 w-full cursor-pointer appearance-none bg-line accent-[var(--tg-webbing)]"
                    aria-label="Adjust corner radius"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="rotation-slider" className="tg-label">
                      Rotation
                    </label>
                    <span className="text-xs text-ink-muted">
                      {config.rotation}°
                    </span>
                  </div>
                  <input
                    id="rotation-slider"
                    type="range"
                    min="-180"
                    max="180"
                    value={config.rotation}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rotation: parseInt(e.target.value),
                      })
                    }
                    className="h-2 w-full cursor-pointer appearance-none bg-line accent-[var(--tg-webbing)]"
                    aria-label="Adjust rotation angle"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="offset-slider" className="tg-label">
                      Vertical Offset
                    </label>
                    <span className="text-xs text-ink-muted">
                      {config.offsetY}
                    </span>
                  </div>
                  <input
                    id="offset-slider"
                    type="range"
                    min="-50"
                    max="50"
                    value={config.offsetY}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        offsetY: parseInt(e.target.value),
                      })
                    }
                    className="h-2 w-full cursor-pointer appearance-none bg-line accent-[var(--tg-webbing)]"
                    aria-label="Adjust vertical offset"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label
                    htmlFor="shadow-toggle"
                    className="text-sm font-medium text-ink"
                  >
                    Drop Shadow
                  </label>
                  <button
                    id="shadow-toggle"
                    onClick={() =>
                      setConfig({ ...config, shadow: !config.shadow })
                    }
                    className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${config.shadow ? 'bg-webbing' : 'bg-line'}`}
                    role="switch"
                    aria-checked={config.shadow}
                    aria-label="Toggle drop shadow"
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-surface transition-transform ${config.shadow ? 'translate-x-5' : ''}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="tg-panel p-5">
              <h3 className="tg-label mb-4">Export Options</h3>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadSVG}
                  disabled={config.type !== 'icon'}
                  className="tg-btn tg-btn-ghost w-full justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Download as SVG"
                >
                  <Download size={16} /> Download SVG
                </button>
                <button
                  onClick={handleExportMultiple}
                  className="tg-btn tg-btn-ghost w-full justify-center"
                  aria-label="Export multiple sizes"
                >
                  <Download size={16} /> Export All Sizes
                </button>
              </div>
            </div>

            <div className="tg-panel p-5">
              <h3 className="tg-label mb-4">Presets</h3>
              <button
                onClick={savePreset}
                className="tg-btn mb-3 w-full justify-center"
                aria-label="Save current configuration as preset"
              >
                <SaveIcon size={16} /> Save Preset
              </button>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPreset(preset)}
                    className="flex w-full items-center gap-2 border border-line bg-ground px-3 py-2 text-sm text-ink transition-colors hover:bg-line"
                    aria-label={`Load preset ${idx + 1}`}
                  >
                    <FolderOpen size={14} /> Preset {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="tg-panel relative flex min-h-[500px] flex-col items-center justify-center overflow-hidden bg-ground lg:col-span-8 lg:min-h-0">
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(var(--tg-line) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="tg-label">Preview</div>

              <div
                className="relative border border-ink transition-all duration-300 ease-out"
                style={{
                  width: `${320 * zoom}px`,
                  height: `${320 * zoom}px`,
                  borderRadius: `${config.radius}%`,
                  background:
                    config.gradient === 'none'
                      ? config.bgColor
                      : config.gradient,
                }}
              >
                <div
                  id="preview-icon-container"
                  className="w-full h-full flex items-center justify-center transition-all duration-300"
                  style={{
                    color: config.fgColor,
                    transform: `rotate(${config.rotation}deg) translateY(${config.offsetY * zoom}px)`,
                    filter: config.shadow
                      ? 'drop-shadow(0px 10px 10px rgba(0,0,0,0.3))'
                      : 'none',
                  }}
                >
                  {config.type === 'text' ? (
                    <span
                      className="preview-text font-bold select-none"
                      style={{
                        fontSize: `${320 * zoom * (config.size / 100)}px`,
                        lineHeight: 1,
                      }}
                    >
                      {config.text}
                    </span>
                  ) : config.type === 'image' && config.uploadedImage ? (
                    <img
                      src={config.uploadedImage}
                      alt="Uploaded"
                      style={{
                        width: `${320 * zoom * (config.size / 100)}px`,
                        height: `${320 * zoom * (config.size / 100)}px`,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <SelectedIcon
                      size={320 * zoom * (config.size / 100)}
                      strokeWidth={1.5}
                      style={{ color: config.fgColor }}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="border border-line bg-surface p-2 text-ink transition-colors hover:bg-ground"
                  aria-label="Zoom out preview"
                >
                  -
                </button>
                <span className="text-xs text-ink-muted">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  className="border border-line bg-surface p-2 text-ink transition-colors hover:bg-ground"
                  aria-label="Zoom in preview"
                >
                  +
                </button>
              </div>

              <div className="text-xs text-ink-muted">
                Output: 1024 x 1024 PNG
              </div>
            </div>

            <div className="absolute bottom-6 right-6 flex gap-2">
              <button
                onClick={() => setConfig(defaultConfig)}
                className="border border-line bg-surface p-2 text-ink-muted transition-colors hover:text-red-500"
                title="Reset"
                aria-label="Reset to default configuration"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TrailLayout>
  );
}
