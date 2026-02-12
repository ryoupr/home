import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { usePageTitle } from '../../hooks/usePageTitle';
import { convertBoxNoteToMarkdown } from './boxnote/convert';

export function BoxNoteConverterPage() {
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  usePageTitle('BoxNote → Markdown');

  const handleFile = useCallback((file: File) => {
    setError('');
    setMarkdown('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = convertBoxNoteToMarkdown(e.target?.result as string);
        setMarkdown(result);
      } catch (err) {
        const detail =
          err instanceof SyntaxError
            ? 'JSONの解析に失敗しました。'
            : err instanceof Error
              ? err.message
              : '';
        setError(
          `変換に失敗しました。有効な .boxnote ファイルか確認してください。${detail ? `\n詳細: ${detail}` : ''}`
        );
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'converted.md';
    a.click();
    URL.revokeObjectURL(a.href);
  }, [markdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to="/tools"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              ← ツール一覧に戻る
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            BoxNote → Markdown 変換
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            .boxnote
            ファイルをドラッグ＆ドロップまたは選択して、Markdownに変換します
          </p>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-primary-400 transition-colors"
                onClick={() => document.getElementById('file-input')?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    document.getElementById('file-input')?.click();
                }}
                role="button"
                tabIndex={0}
              >
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  📄 .boxnote ファイルをドロップ、またはクリックして選択
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".boxnote"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
              {error && (
                <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
              )}
            </CardContent>
          </Card>

          {markdown && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    変換結果
                  </h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {copied ? '✓ コピー済み' : 'コピー'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                    >
                      .md ダウンロード
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-auto max-h-[600px] text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {markdown}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
