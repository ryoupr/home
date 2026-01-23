import React, { useState, useMemo, useRef } from 'react';
import { Download, RotateCcw, Type, Smile, Palette, Box, Undo2, Redo2, Save as SaveIcon, FolderOpen, Upload as UploadIcon, Image as ImageIconLucide } from 'lucide-react';
import { iconMap, iconKeys } from './iconMap';
import { GRADIENTS, CANVAS_SIZE, GRADIENT_COLORS } from './iconGeneratorConstants';
import { IconConfig, defaultConfig, createCanvas, drawBackground, drawIcon, drawText, drawUploadedImage, downloadCanvas, downloadSVG, exportMultipleSizes } from './iconGeneratorHelpers';
import { useUndoRedo, useLocalStorage } from './iconGeneratorHooks';

export default function IconGeneratorPage() {
  const { currentState: config, setState: setConfig, undo, redo, canUndo, canRedo } = useUndoRedo<IconConfig>(defaultConfig);
  const [presets, setPresets] = useLocalStorage<IconConfig[]>('icon-presets', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredIcons = useMemo(() => {
    if (!searchQuery) return iconKeys;
    return iconKeys.filter(key => key.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const handleDownload = async () => {
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
  };

  const handleDownloadSVG = () => {
    const previewElement = document.getElementById('preview-icon-container');
    const svgNode = previewElement?.querySelector('svg');
    if (config.type === 'icon' && svgNode) {
      downloadSVG(config, svgNode, 'icon.svg');
    }
  };

  const handleExportMultiple = async () => {
    const previewElement = document.getElementById('preview-icon-container');
    await exportMultipleSizes(config, previewElement, [16, 32, 64, 128, 256, 512, 1024]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setConfig({ ...config, type: 'image', uploadedImage: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const savePreset = () => {
    setPresets([...presets, config]);
  };

  const loadPreset = (preset: IconConfig) => {
    setConfig(preset);
  };

  const SelectedIcon = iconMap[config.iconKey] || iconMap.Zap;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Box size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">
              IconMaker<span className="text-blue-600">.</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Undo"
              aria-label="Undo last action"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Redo"
              aria-label="Redo last action"
            >
              <Redo2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[calc(100vh-6rem)] pb-20 custom-scrollbar">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Type size={14} /> Content
            </h3>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl mb-4">
              <button
                onClick={() => setConfig({ ...config, type: 'icon' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${config.type === 'icon' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                aria-label="Select icon mode"
              >
                <Smile size={16} /> Icon
              </button>
              <button
                onClick={() => setConfig({ ...config, type: 'text' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${config.type === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                aria-label="Select text mode"
              >
                <Type size={16} /> Text
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${config.type === 'image' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg text-center font-bold"
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
                  className="w-full px-4 py-2 mb-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  aria-label="Search for icons"
                />
                <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
                  {filteredIcons.map((key) => {
                    const IconComponent = iconMap[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setConfig({ ...config, iconKey: key })}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${config.iconKey === key ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-1' : 'hover:bg-slate-100 text-slate-500'}`}
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
              <div className="text-center text-slate-500 py-8">
                {config.uploadedImage ? 'Image uploaded' : 'Click Image button to upload'}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Palette size={14} /> Style
            </h3>

            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 mb-2 block" htmlFor="bg-color">Background</label>
              <div className="flex gap-3 mb-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                  <input
                    id="bg-color"
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setConfig({ ...config, bgColor: e.target.value, gradient: 'none' })}
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
                          const gradientName = g.value.match(/Sunset|Ocean|Purple|Midnight|Cherry|Nature|Slick/)?.[0];
                          const newBgColor = gradientName && GRADIENT_COLORS[gradientName] ? GRADIENT_COLORS[gradientName][0] : config.bgColor;
                          setConfig({ ...config, gradient: g.value, bgColor: newBgColor });
                        }
                      }}
                      className={`w-10 h-10 rounded-full flex-shrink-0 border-2 transition-all ${config.gradient === g.value ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ background: g.value === 'none' ? config.bgColor : g.value }}
                      title={g.name}
                      aria-label={`Select ${g.name} gradient`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 mb-2 block" htmlFor="fg-color">Icon / Text Color</label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                  <input
                    id="fg-color"
                    type="color"
                    value={config.fgColor}
                    onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    aria-label="Select foreground color"
                  />
                </div>
                <input
                  type="text"
                  value={config.fgColor}
                  onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase"
                  aria-label="Foreground color hex value"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="size-slider" className="text-xs font-semibold text-slate-500">Size</label>
                  <span className="text-xs text-slate-400">{config.size}%</span>
                </div>
                <input
                  id="size-slider"
                  type="range"
                  min="20"
                  max="90"
                  value={config.size}
                  onChange={(e) => setConfig({ ...config, size: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  aria-label="Adjust icon size"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="radius-slider" className="text-xs font-semibold text-slate-500">Corner Radius</label>
                  <span className="text-xs text-slate-400">{config.radius}%</span>
                </div>
                <input
                  id="radius-slider"
                  type="range"
                  min="0"
                  max="50"
                  value={config.radius}
                  onChange={(e) => setConfig({ ...config, radius: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  aria-label="Adjust corner radius"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="rotation-slider" className="text-xs font-semibold text-slate-500">Rotation</label>
                  <span className="text-xs text-slate-400">{config.rotation}°</span>
                </div>
                <input
                  id="rotation-slider"
                  type="range"
                  min="-180"
                  max="180"
                  value={config.rotation}
                  onChange={(e) => setConfig({ ...config, rotation: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  aria-label="Adjust rotation angle"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="offset-slider" className="text-xs font-semibold text-slate-500">Vertical Offset</label>
                  <span className="text-xs text-slate-400">{config.offsetY}</span>
                </div>
                <input
                  id="offset-slider"
                  type="range"
                  min="-50"
                  max="50"
                  value={config.offsetY}
                  onChange={(e) => setConfig({ ...config, offsetY: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  aria-label="Adjust vertical offset"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label htmlFor="shadow-toggle" className="text-sm font-medium text-slate-700">Drop Shadow</label>
                <button
                  id="shadow-toggle"
                  onClick={() => setConfig({ ...config, shadow: !config.shadow })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${config.shadow ? 'bg-blue-600' : 'bg-slate-300'}`}
                  role="switch"
                  aria-checked={config.shadow}
                  aria-label="Toggle drop shadow"
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${config.shadow ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Export Options</h3>
            <div className="space-y-2">
              <button
                onClick={handleDownloadSVG}
                disabled={config.type !== 'icon'}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Download as SVG"
              >
                <Download size={16} /> Download SVG
              </button>
              <button
                onClick={handleExportMultiple}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                aria-label="Export multiple sizes"
              >
                <Download size={16} /> Export All Sizes
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Presets</h3>
            <button
              onClick={savePreset}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mb-3 transition-all"
              aria-label="Save current configuration as preset"
            >
              <SaveIcon size={16} /> Save Preset
            </button>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(preset)}
                  className="w-full flex items-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm transition-all"
                  aria-label={`Load preset ${idx + 1}`}
                >
                  <FolderOpen size={14} /> Preset {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-slate-100 rounded-2xl border border-slate-200 min-h-[500px] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="text-slate-400 text-sm font-medium uppercase tracking-widest">Preview</div>

            <div
              className="relative shadow-2xl transition-all duration-300 ease-out"
              style={{
                width: `${320 * zoom}px`,
                height: `${320 * zoom}px`,
                borderRadius: `${config.radius}%`,
                background: config.gradient === 'none' ? config.bgColor : config.gradient,
              }}
            >
              <div
                id="preview-icon-container"
                className="w-full h-full flex items-center justify-center transition-all duration-300"
                style={{
                  color: config.fgColor,
                  transform: `rotate(${config.rotation}deg) translateY(${config.offsetY * zoom}px)`,
                  filter: config.shadow ? 'drop-shadow(0px 10px 10px rgba(0,0,0,0.3))' : 'none'
                }}
              >
                {config.type === 'text' ? (
                  <span
                    className="preview-text font-bold select-none"
                    style={{ fontSize: `${320 * zoom * (config.size / 100)}px`, lineHeight: 1 }}
                  >
                    {config.text}
                  </span>
                ) : config.type === 'image' && config.uploadedImage ? (
                  <img
                    src={config.uploadedImage}
                    alt="Uploaded"
                    style={{ width: `${320 * zoom * (config.size / 100)}px`, height: `${320 * zoom * (config.size / 100)}px`, objectFit: 'contain' }}
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
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-all"
                aria-label="Zoom out preview"
              >
                -
              </button>
              <span className="text-slate-400 text-xs">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-all"
                aria-label="Zoom in preview"
              >
                +
              </button>
            </div>

            <div className="text-slate-400 text-xs">Output: 1024 x 1024 PNG</div>
          </div>

          <div className="absolute bottom-6 right-6 flex gap-2">
            <button
              onClick={() => setConfig(defaultConfig)}
              className="p-2 bg-white text-slate-500 rounded-full shadow-sm hover:text-red-500 transition-colors"
              title="Reset"
              aria-label="Reset to default configuration"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
