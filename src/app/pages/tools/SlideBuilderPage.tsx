import DOMPurify from 'dompurify';
import { Code, Download, Eye, Loader2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CDN_LIBS } from '../../cdnConfig';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  extractSlides,
  generatePptx,
  type SlideElement,
} from './slideBuilderUtils';

const PPTX_CDN = CDN_LIBS.pptxgenjs.url;
const PPTX_SRI = CDN_LIBS.pptxgenjs.sri;

const SAMPLE_HTML = `<!DOCTYPE html>
<html><head><style>
body { margin: 0; font-family: sans-serif; }
.slide { width: 1280px; height: 720px; background: #fff; position: relative; padding: 60px; display: flex; flex-direction: column; }
.title { font-size: 36px; font-weight: bold; color: #1a1a1a; border-left: 8px solid #B21E35; padding-left: 20px; margin-bottom: 30px; }
.cards { display: flex; gap: 24px; flex: 1; }
.card { flex: 1; border: 1px solid #e2e2e2; border-top: 4px solid #B21E35; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
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

// --- Toast ---
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl"
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        aria-label="通知を閉じる"
        className="text-gray-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- Component ---
export function SlideBuilderPage() {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const sanitizedHtml = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'div',
          'span',
          'p',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'a',
          'img',
          'ul',
          'ol',
          'li',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'br',
          'hr',
          'b',
          'i',
          'strong',
          'em',
          'u',
          's',
          'sub',
          'sup',
          'svg',
          'path',
          'circle',
          'rect',
          'line',
          'polyline',
          'polygon',
          'g',
          'section',
          'article',
          'header',
          'footer',
          'nav',
          'main',
        ],
        ALLOWED_ATTR: [
          'class',
          'id',
          'style',
          'src',
          'alt',
          'href',
          'width',
          'height',
          'viewBox',
          'd',
          'fill',
          'stroke',
          'stroke-width',
          'cx',
          'cy',
          'r',
          'x',
          'y',
          'x1',
          'y1',
          'x2',
          'y2',
          'points',
          'transform',
          'xmlns',
          'role',
          'aria-label',
          'data-slide',
        ],
      }),
    [html]
  );
  const [showPreview, setShowPreview] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ slides: 0, elements: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  usePageTitle('Slide Builder');

  // ResizeObserver with debounce
  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const obs = new ResizeObserver((entries) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const { width } = entries[0].contentRect;
        setPreviewScale(Math.min((width - 32) / 1280, 0.9));
      }, 100);
    });
    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTimeout(timer);
    };
  }, [showPreview]);

  // CDN load with SRI and state management
  const [cdnReady, setCdnReady] = useState(!!window.PptxGenJS);
  useEffect(() => {
    if (document.getElementById('pptxgenjs-cdn')) {
      setCdnReady(!!window.PptxGenJS);
      return;
    }
    const s = document.createElement('script');
    s.id = 'pptxgenjs-cdn';
    s.src = PPTX_CDN;
    s.integrity = PPTX_SRI;
    s.crossOrigin = 'anonymous';
    s.onload = () => setCdnReady(true);
    document.head.appendChild(s);
  }, []);

  // #1: Reusable hidden iframe with allow-same-origin (no scripts) for DOM extraction
  const extractIframeRef = useRef<HTMLIFrameElement | null>(null);
  const extractWithTempIframe = useCallback(
    (htmlContent: string): Promise<SlideElement[][]> => {
      return new Promise((resolve) => {
        let tmp = extractIframeRef.current;
        if (!tmp || !tmp.isConnected) {
          tmp = document.createElement('iframe');
          tmp.sandbox.add('allow-same-origin');
          tmp.style.cssText =
            'position:fixed;left:-9999px;width:1280px;height:720px;visibility:hidden';
          document.body.appendChild(tmp);
          extractIframeRef.current = tmp;
        }
        tmp.onload = () => {
          try {
            const doc = tmp?.contentDocument;
            resolve(doc ? extractSlides(doc) : [[]]);
          } catch (e) {
            console.warn('Extraction failed:', e);
            resolve([[]]);
          }
        };
        tmp.srcdoc = htmlContent;
      });
    },
    []
  );

  useEffect(
    () => () => {
      extractIframeRef.current?.remove();
    },
    []
  );

  const updateStats = useCallback(async () => {
    try {
      const slides = await extractWithTempIframe(html);
      setStats({
        slides: slides.length,
        elements: slides.reduce((s, sl) => s + sl.length, 0),
      });
    } catch (e) {
      console.warn('Stats update failed:', e);
      setStats({ slides: 0, elements: 0 });
    }
  }, [html, extractWithTempIframe]);

  const onIframeLoad = useCallback(() => {
    updateStats();
  }, [updateStats]);

  useEffect(() => {
    const t = setTimeout(updateStats, 500);
    return () => clearTimeout(t);
  }, [html, updateStats]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleExport = useCallback(async () => {
    if (!cdnReady || !window.PptxGenJS) {
      showToast('PptxGenJS を読み込み中...');
      return;
    }
    setExporting(true);
    try {
      const slides = await extractWithTempIframe(html);
      generatePptx(slides, 'slide-output.pptx');
    } catch (e) {
      showToast('エクスポートエラー: ' + (e as Error).message);
    } finally {
      setExporting(false);
    }
  }, [html, showToast, extractWithTempIframe]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              to="/tools"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              ← ツール一覧に戻る
            </Link>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Slide Builder
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  HTMLスライドコードを貼り付けて、各要素が個別に編集可能なPPTXファイルを生成
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.elements > 0 &&
                    `${stats.slides}スライド / ${stats.elements}要素`}
                </span>
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <button
                    onClick={() => setShowPreview((p) => !p)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${showPreview ? 'bg-rose-600' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={showPreview}
                    aria-label="プレビュー表示の切り替え"
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${showPreview ? 'translate-x-5' : ''}`}
                    />
                  </button>
                  <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting || !cdnReady}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors font-medium shadow-md"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  PPTX ダウンロード
                </button>
              </div>
            </div>
          </div>

          <div
            className={`grid gap-4 ${showPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
            style={{ height: 'calc(100vh - 200px)' }}
          >
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-600">
                HTML コード
              </div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="flex-1 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
                spellCheck={false}
                aria-label="HTMLコード入力"
                placeholder="HTMLスライドコードを貼り付けてください..."
              />
            </div>

            {showPreview && (
              <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-600">
                  プレビュー
                </div>
                <div
                  ref={previewContainerRef}
                  className="flex-1 overflow-hidden bg-gray-200 dark:bg-gray-900 flex items-start justify-center p-4"
                >
                  <div
                    style={{
                      width: 1280 * previewScale,
                      height: 720 * previewScale,
                      flexShrink: 0,
                    }}
                  >
                    <iframe
                      ref={iframeRef}
                      srcDoc={sanitizedHtml}
                      onLoad={onIframeLoad}
                      title="スライドプレビュー"
                      className="bg-white shadow-lg"
                      style={{
                        width: 1280,
                        height: 720,
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top left',
                        border: 'none',
                      }}
                      // sandbox: allow-scripts for CSS rendering, no allow-same-origin to prevent DOM access
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
