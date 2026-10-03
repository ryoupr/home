import { TOOLS } from '../../data/tools';
import { PageHeading } from '../components/trail/PageHeading';
import { ToolsLegend } from '../components/trail/ToolsLegend';
import { TrailLayout } from '../components/trail/TrailLayout';
import { usePageTitle } from '../hooks/usePageTitle';

export function ToolsPage() {
  usePageTitle('Tools');
  return (
    <TrailLayout>
      <div className="flex flex-col gap-8">
        <PageHeading
          title="Tools"
          note={`Legend · 凡例 · ${TOOLS.length} tools`}
        >
          ブラウザだけで動く WEB
          ツールです。データはサーバーに送らず、手元のブラウザ内で処理します。
        </PageHeading>
        <ToolsLegend showTags />
      </div>
    </TrailLayout>
  );
}
