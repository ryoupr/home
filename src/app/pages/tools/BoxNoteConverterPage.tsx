import { useCallback, useState } from 'react';
import { PageHeading } from '../../components/trail/PageHeading';
import { TrailLayout } from '../../components/trail/TrailLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { convertBoxNoteToMarkdown } from './boxnote/convert';

export function BoxNoteConverterPage() {
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  usePageTitle('BoxNote → Markdown');

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFile = useCallback((file: File) => {
    setError('');
    setMarkdown('');
    if (file.size > MAX_FILE_SIZE) {
      setError('ファイルサイズが大きすぎます（上限: 10MB）');
      return;
    }
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
    <TrailLayout>
      <div className="flex flex-col gap-6">
        <PageHeading
          title="BoxNote → Markdown"
          back={{ to: '/tools', label: 'Tools' }}
        >
          .boxnote ファイルをドラッグ＆ドロップまたは選択して、Markdown
          に変換します
        </PageHeading>

        <section className="tg-panel p-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="cursor-pointer border-2 border-dashed border-line p-12 text-center transition-colors hover:border-webbing"
            onClick={() => document.getElementById('file-input')?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ')
                document.getElementById('file-input')?.click();
            }}
            role="button"
            tabIndex={0}
          >
            <p className="text-lg text-ink-muted">
              .boxnote ファイルをドロップ、またはクリックして選択
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
          {error && <p className="mt-4 text-destructive">{error}</p>}
        </section>

        {markdown && (
          <section className="tg-panel p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="tg-display text-xl tracking-[0.08em]">変換結果</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="tg-btn tg-btn-ghost"
                >
                  {copied ? '✓ コピー済み' : 'コピー'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="tg-btn"
                >
                  .md ダウンロード
                </button>
              </div>
            </div>
            <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap border border-line bg-ground p-4 font-mono text-sm">
              {markdown}
            </pre>
          </section>
        )}
      </div>
    </TrailLayout>
  );
}
