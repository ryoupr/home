import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Code, Loader2, X } from 'lucide-react';
import { useSlideBuilder } from './slideBuilder/useSlideBuilder';

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

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl">
      <span className="text-sm">{message}</span>
      <button onClick={onClose} aria-label="通知を閉じる" className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
    </div>
  );
}

export function SlideBuilderPage() {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const {
    exporting, stats, toast, setToast, iframeRef, previewContainerRef,
    previewScale, showPreview, setShowPreview, cdnReady,
    onIframeLoad, handleExport, sanitizedHtml,
  } = useSlideBuilder(html);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link to="/tools" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              ← ツール一覧に戻る
            </Link>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Slide Builder</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">HTMLスライドコードを貼り付けて、各要素が個別に編集可能なPPTXファイルを生成</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.elements > 0 && `${stats.slides}スライド / ${stats.elements}要素`}
                </span>
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <button onClick={() => setShowPreview(p => !p)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${showPreview ? 'bg-rose-600' : 'bg-slate-300'}`} role="switch" aria-checked={showPreview} aria-label="プレビュー表示の切り替え">
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${showPreview ? 'translate-x-5' : ''}`} />
                  </button>
                  <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <button onClick={handleExport} disabled={exporting || !cdnReady} className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors font-medium shadow-md">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  PPTX ダウンロード
                </button>
              </div>
            </div>
          </div>

          <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`} style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-600">HTML コード</div>
              <textarea value={html} onChange={e => setHtml(e.target.value)} className="flex-1 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none" spellCheck={false} aria-label="HTMLコード入力" placeholder="HTMLスライドコードを貼り付けてください..." />
            </div>
            {showPreview && (
              <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-600">プレビュー</div>
                <div ref={previewContainerRef} className="flex-1 overflow-hidden bg-gray-200 dark:bg-gray-900 flex items-start justify-center p-4">
                  <div style={{ width: 1280 * previewScale, height: 720 * previewScale, flexShrink: 0 }}>
                    <iframe ref={iframeRef} srcDoc={sanitizedHtml} onLoad={onIframeLoad} title="スライドプレビュー" className="bg-white shadow-lg" style={{ width: 1280, height: 720, transform: `scale(${previewScale})`, transformOrigin: 'top left', border: 'none' }} sandbox="allow-scripts" />
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
