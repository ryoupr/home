import { PageHeading } from '../../components/trail/PageHeading';
import { TrailLayout } from '../../components/trail/TrailLayout';
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * 新しいツールページのひな形。
 * 外枠は TrailLayout（画面いっぱいを使うツールは variant="app"）、色は theme.css のトークン
 * （bg-surface / text-ink / text-ink-muted / border-line / bg-webbing など）だけを使う。
 */
export function SampleToolPage() {
  usePageTitle('Sample Tool');
  return (
    <TrailLayout>
      <div className="flex flex-col gap-6">
        <PageHeading
          title="Sample Tool"
          back={{ to: '/tools', label: 'Tools' }}
        >
          ツールの説明をここに書きます。
        </PageHeading>
        <section className="tg-panel p-6">
          <p className="text-ink-muted">ここにツールの実装を追加してください</p>
        </section>
      </div>
    </TrailLayout>
  );
}
