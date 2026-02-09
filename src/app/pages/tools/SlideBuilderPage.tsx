import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Code, Loader2 } from 'lucide-react';

declare global {
  interface Window { PptxGenJS?: new () => any; }
}

const PPTX_CDN = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
const PX_TO_INCH = 13.333 / 1280; // 16:9 slide: 13.333" wide, mapped from 1280px

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
  fill?: string;
  borderColor?: string; borderWidth?: number; borderRadius?: number;
  text?: string; fontSize?: number; fontBold?: boolean; fontColor?: string;
  fontFamily?: string; align?: string; valign?: string;
  lineHeight?: number;
  imgSrc?: string;
}

function extractElements(doc: Document): SlideElement[] {
  // Find slide container: largest element or body
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
  const scaleX = 13.333 / cRect.width;
  const scaleY = 7.5 / cRect.height;
  const elements: SlideElement[] = [];

  function walk(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);

    if (rect.width < 1 || rect.height < 1) return;
    if (style.display === 'none' || style.visibility === 'hidden') return;

    const x = (rect.left - cRect.left) * scaleX;
    const y = (rect.top - cRect.top) * scaleY;
    const w = rect.width * scaleX;
    const h = rect.height * scaleY;

    // Skip elements outside the slide
    if (x + w < 0 || y + h < 0 || x > 13.5 || y > 7.7) return;

    const bg = style.backgroundColor;
    const hasBg = !isTransparent(bg);
    const borderW = parseFloat(style.borderTopWidth) || 0;
    const hasBorder = borderW > 0 && !isTransparent(style.borderTopColor);
    const borderRadius = parseFloat(style.borderRadius) || 0;

    // Add shape for background/border
    if (hasBg || hasBorder) {
      const elem: SlideElement = { type: 'shape', x, y, w, h };
      if (hasBg) elem.fill = rgbToHex(bg) || undefined;
      if (hasBorder) {
        elem.borderColor = rgbToHex(style.borderTopColor) || undefined;
        elem.borderWidth = borderW * scaleX;
      }
      if (borderRadius > Math.min(rect.width, rect.height) * 0.4) {
        elem.borderRadius = 50; // treat as oval-ish
      }
      elements.push(elem);
    }

    // Handle images
    if (el.tagName === 'IMG') {
      const src = (el as HTMLImageElement).src;
      if (src && !src.startsWith('data:')) {
        elements.push({ type: 'image', x, y, w, h, imgSrc: src });
      }
      return;
    }

    // Handle text: only if this element has direct text node children
    const directText = Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent?.trim())
      .filter(Boolean)
      .join(' ');

    if (directText) {
      const fontSize = parseFloat(style.fontSize) * 0.75; // px to pt
      elements.push({
        type: 'text', x, y, w, h,
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

    // Recurse into children
    for (const child of Array.from(el.children) as HTMLElement[]) {
      walk(child);
    }
  }

  walk(container);
  return elements;
}

// --- PPTX generation ---
function generatePptx(elements: SlideElement[], filename: string) {
  const pptx = new window.PptxGenJS!();
  pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
  pptx.layout = 'WIDE';
  const slide = pptx.addSlide();

  for (const el of elements) {
    const pos = { x: el.x, y: el.y, w: el.w, h: el.h };

    if (el.type === 'shape') {
      const opts: any = {
        ...pos,
        fill: el.fill ? { color: el.fill } : { type: 'none' },
        line: el.borderColor ? { color: el.borderColor, width: Math.max(0.5, (el.borderWidth || 1) * 72) } : { type: 'none' },
      };
      if (el.borderRadius && el.borderRadius >= 50) {
        opts.rectRadius = 0.2;
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

// --- Component ---
export function SlideBuilderPage() {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [showPreview, setShowPreview] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [elementCount, setElementCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => { document.title = 'Slide Builder | ryoupr'; }, []);

  // Load pptxgenjs
  useEffect(() => {
    if (document.getElementById('pptxgenjs-cdn')) return;
    const s = document.createElement('script');
    s.id = 'pptxgenjs-cdn';
    s.src = PPTX_CDN;
    document.head.appendChild(s);
  }, []);

  // Update element count when iframe loads
  const onIframeLoad = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) setElementCount(extractElements(doc).length);
    } catch { setElementCount(0); }
  }, []);

  const handleExport = useCallback(async () => {
    if (!window.PptxGenJS) { alert('PptxGenJS loading...'); return; }
    const doc = iframeRef.current?.contentDocument;
    if (!doc) { alert('プレビューが読み込まれていません'); return; }

    setExporting(true);
    try {
      // Small delay to ensure rendering is complete
      await new Promise(r => setTimeout(r, 100));
      const elements = extractElements(doc);
      generatePptx(elements, 'slide-output.pptx');
    } catch (e) {
      alert('エクスポートエラー: ' + (e as Error).message);
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link to="/tools" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors">
                ← ツール一覧に戻る
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Slide Builder</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                HTMLスライドコードを貼り付けて、各要素が個別に編集可能なPPTXファイルを生成
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {elementCount > 0 && `${elementCount} 要素検出`}
              </span>
              <button
                onClick={() => setShowPreview(p => !p)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {showPreview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'コードのみ' : 'プレビュー表示'}
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PPTX出力
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className={`grid gap-4 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`} style={{ height: 'calc(100vh - 200px)' }}>
            {/* Code editor */}
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

            {/* Preview */}
            {showPreview && (
              <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-600">
                  プレビュー
                </div>
                <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex items-start justify-center p-4">
                  <iframe
                    ref={iframeRef}
                    srcDoc={html}
                    onLoad={onIframeLoad}
                    className="bg-white shadow-lg"
                    style={{ width: '1280px', height: '720px', transform: 'scale(0.5)', transformOrigin: 'top center', border: 'none' }}
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
