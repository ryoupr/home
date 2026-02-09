import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Code, Loader2, X } from 'lucide-react';

declare global {
  interface Window { PptxGenJS?: new () => any; }
}

const PPTX_CDN = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// --- Color helpers ---
function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  const [, r, g, b] = m.map(Number);
  if (rgb.includes('rgba') && rgb.match(/,\s*([\d.]+)\)/) && parseFloat(rgb.match(/,\s*([\d.]+)\)/)![1]) < 0.05) return null;
  return [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function isTransparent(color: string): boolean {
  return !color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

// --- DOM element extraction ---
interface SlideElement {
  type: 'shape' | 'text' | 'image';
  x: number; y: number; w: number; h: number;
  zIndex: number;
  fill?: string;
  borderColor?: string; borderWidth?: number; borderRadius?: number;
  text?: string; fontSize?: number; fontBold?: boolean; fontColor?: string;
  fontFamily?: string; align?: string; valign?: string;
  lineHeight?: number;
  imgSrc?: string;
}

function extractElements(doc: Document): SlideElement[] {
  if (!doc.body) return [];

  const all = Array.from(doc.body.querySelectorAll('*')) as HTMLElement[];
  let container = doc.body;
  let maxArea = 0;
  for (const el of all) {
    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    if (area > maxArea && r.width >= 800 && r.height >= 400) {
      maxArea = area;
      container = el;
    }
  }

  const cRect = container.getBoundingClientRect();
  const scaleX = SLIDE_W / cRect.width;
  const scaleY = SLIDE_H / cRect.height;
  const elements: SlideElement[] = [];
  let order = 0;

  // #1: Track which text belongs to deepest element only
  const textOwners = new Set<string>();

  function walk(el: HTMLElement, depth: number) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);

    if (rect.width < 1 || rect.height < 1) return;
    if (style.display === 'none' || style.visibility === 'hidden') return;

    const x = (rect.left - cRect.left) * scaleX;
    const y = (rect.top - cRect.top) * scaleY;
    const w = rect.width * scaleX;
    const h = rect.height * scaleY;

    // #5: Fix boundary check to match slide dimensions
    if (x + w < 0 || y + h < 0 || x > SLIDE_W || y > SLIDE_H) return;

    // #3: z-index
    const zIndex = parseInt(style.zIndex) || order++;

    const bg = style.backgroundColor;
    const hasBg = !isTransparent(bg);
    const borderW = parseFloat(style.borderTopWidth) || 0;
    const hasBorder = borderW > 0 && !isTransparent(style.borderTopColor);
    const borderRadius = parseFloat(style.borderRadius) || 0;

    if (hasBg || hasBorder) {
      const elem: SlideElement = { type: 'shape', x, y, w, h, zIndex };
      if (hasBg) elem.fill = rgbToHex(bg) || undefined;
      if (hasBorder) {
        elem.borderColor = rgbToHex(style.borderTopColor) || undefined;
        elem.borderWidth = borderW;
      }
      // #6: Reflect actual borderRadius in inches
      if (borderRadius > 0) {
        elem.borderRadius = borderRadius * scaleX;
      }
      elements.push(elem);
    }

    if (el.tagName === 'IMG') {
      const src = (el as HTMLImageElement).src;
      if (src && !src.startsWith('data:')) {
        elements.push({ type: 'image', x, y, w, h, zIndex, imgSrc: src });
      }
      return;
    }

    // Recurse first so children register their text before parent
    for (const child of Array.from(el.children) as HTMLElement[]) {
      walk(child, depth + 1);
    }

    // #1: Only extract text if no child already owns it
    const directText = Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent?.trim())
      .filter(Boolean)
      .join(' ');

    if (directText && !textOwners.has(directText)) {
      textOwners.add(directText);
      const fontSize = parseFloat(style.fontSize) * 0.75; // px to pt
      elements.push({
        type: 'text', x, y, w, h, zIndex,
        text: directText,
        fontSize: Math.max(6, Math.min(72, fontSize)),
        fontBold: parseInt(style.fontWeight) >= 700 || style.fontWeight === 'bold',
        fontColor: rgbToHex(style.color) || '333333',
        fontFamily: style.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        align: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'right' : 'left',
        valign: style.display === 'flex' && style.alignItems === 'center' ? 'middle' : 'top',
        lineHeight: parseFloat(style.lineHeight) / parseFloat(style.fontSize) || 1.4,
      });
    }
  }

  walk(container, 0);

  // #3: Sort by z-index for correct stacking order in PPTX
  elements.sort((a, b) => a.zIndex - b.zIndex);
  return elements;
}

// --- PPTX generation ---
function generatePptx(elements: SlideElement[], filename: string) {
  const pptx = new window.PptxGenJS!();
  pptx.defineLayout({ name: 'WIDE', width: SLIDE_W, height: SLIDE_H });
  pptx.layout = 'WIDE';
  const slide = pptx.addSlide();

  for (const el of elements) {
    const pos = { x: el.x, y: el.y, w: el.w, h: el.h };

    if (el.type === 'shape') {
      const opts: any = {
        ...pos,
        fill: el.fill ? { color: el.fill } : { type: 'none' },
        // #2: borderWidth is in px, pptxgenjs line.width expects pt (1px ≈ 0.75pt)
        line: el.borderColor ? { color: el.borderColor, width: Math.max(0.5, (el.borderWidth || 1) * 0.75) } : { type: 'none' },
      };
      // #6: Use actual borderRadius value (already in inches from extraction)
      if (el.borderRadius && el.borderRadius > 0) {
        opts.rectRadius = Math.min(el.borderRadius, Math.min(el.w, el.h) / 2);
      }
      slide.addShape('rect', opts);
    }

    if (el.type === 'text' && el.text) {
      slide.addText(el.text, {
        ...pos,
        fontSize: el.fontSize || 12,
        bold: el.fontBold || false,
        color: el.fontColor || '333333',
        fontFace: el.fontFamily || 'Yu Gothic',
        align: el.align || 'left',
        valign: el.valign || 'top',
        wrap: true,
        lineSpacingMultiple: el.lineHeight || 1.4,
      });
    }

    if (el.type === 'image' && el.imgSrc) {
      try {
        slide.addImage({ path: el.imgSrc, ...pos });
      } catch { /* skip failed images */ }
    }
  }

  pptx.writeFile({ fileName: filename });
}

// --- Default sample HTML ---
const SAMPLE_HTML = `<!DOCTYPE html>
<html><head><style>
body { margin: 0; font-family: sans-serif; }
.slide { width: 1280px; height: 720px; background: #fff; position: relative; padding: 60px; display: flex; flex-direction: column; }
.title { font-size: 36px; font-weight: bold; color: #1a1a1a; border-left: 8px solid #B21E35; padding-left: 20px; margin-bottom: 30px; }
.cards { display: flex; gap: 24px; flex: 1; }
.card { flex: 1; border: 1px solid #e2e2e2; border-top: 4px solid #B21E35; padding: 24px; }
.card h3 { color: #B21E35; margin: 0 0 12px; font-size: 18px; }
.card p { color: #333; font-size: 14px; line-height: 1.6; margin: 0; }
.footer { margin-top: 30px; font-size: 12px; color: #999; text-align: right; }
</style></head><body>
<div class="slide">
  <div class="title">サンプルスライド</div>
  <div class="cards">
    <div class="card"><h3>項目1</h3><p>テキストを入力してください</p></div>
    <div class="card"><h3>項目2</h3><p>テキストを入力してください</p></div>
    <div class="card"><h3>項目3</h3><p>テキストを入力してください</p></div>
  </div>
  <div class="footer">© Sample Slide</div>
</div>
</body></html>`;

// --- Toast component ---
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl">
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
    </div>
  );
}

// --- Component ---
export function SlideBuilderPage() {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [showPreview, setShowPreview] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [elementCount, setElementCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  useEffect(() => { document.title = 'Slide Builder | ryoupr'; }, []);

  // Fit preview to container
  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setPreviewScale(Math.min((width - 32) / 1280, 0.9));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [showPreview]);

  // Load pptxgenjs
  useEffect(() => {
    if (document.getElementById('pptxgenjs-cdn')) return;
    const s = document.createElement('script');
    s.id = 'pptxgenjs-cdn';
    s.src = PPTX_CDN;
    document.head.appendChild(s);
  }, []);

  // #7: Update element count on iframe load AND on html change (debounced)
  const updateCount = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) setElementCount(extractElements(doc).length);
    } catch { setElementCount(0); }
  }, []);

  const onIframeLoad = useCallback(() => updateCount(), [updateCount]);

  useEffect(() => {
    const t = setTimeout(updateCount, 500);
    return () => clearTimeout(t);
  }, [html, updateCount]);

  // #12: Toast-based error/info display
  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleExport = useCallback(async () => {
    if (!window.PptxGenJS) { showToast('PptxGenJS を読み込み中...'); return; }
    const doc = iframeRef.current?.contentDocument;
    if (!doc) { showToast('プレビューが読み込まれていません'); return; }

    setExporting(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const elements = extractElements(doc);
      generatePptx(elements, 'slide-output.pptx');
    } catch (e) {
      showToast('エクスポートエラー: ' + (e as Error).message);
    } finally {
      setExporting(false);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/tools" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              ← ツール一覧に戻る
            </Link>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Slide Builder</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  HTMLスライドコードを貼り付けて、各要素が個別に編集可能なPPTXファイルを生成
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {elementCount > 0 && `${elementCount} 要素検出`}
                </span>
                {/* #9: aria-label added */}
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <button
                    onClick={() => setShowPreview(p => !p)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${showPreview ? 'bg-rose-600' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={showPreview}
                    aria-label="プレビュー表示の切り替え"
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${showPreview ? 'translate-x-5' : ''}`} />
                  </button>
                  <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors font-medium shadow-md"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  PPTX ダウンロード
                </button>
              </div>
            </div>
          </div>

          {/* #8: Responsive grid */}
          <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`} style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-600">
                HTML コード
              </div>
              <textarea
                value={html}
                onChange={e => setHtml(e.target.value)}
                className="flex-1 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
                spellCheck={false}
                placeholder="HTMLスライドコードを貼り付けてください..."
              />
            </div>

            {showPreview && (
              <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-600">
                  プレビュー
                </div>
                <div ref={previewContainerRef} className="flex-1 overflow-hidden bg-gray-200 dark:bg-gray-900 flex items-start justify-center p-4">
                  <div style={{ width: 1280 * previewScale, height: 720 * previewScale, flexShrink: 0 }}>
                    {/* #4: sandbox with allow-scripts for CSS animations */}
                    <iframe
                      ref={iframeRef}
                      srcDoc={html}
                      onLoad={onIframeLoad}
                      className="bg-white shadow-lg"
                      style={{ width: 1280, height: 720, transform: `scale(${previewScale})`, transformOrigin: 'top left', border: 'none' }}
                      sandbox="allow-same-origin allow-scripts"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* #12: Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
