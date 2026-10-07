import { useMemo, useState } from 'react';
import config from '../../data/config.json';
import { GearRack } from '../components/trail/GearRack';
import type { GearProject } from '../components/trail/GearTag';
import { PageHeading } from '../components/trail/PageHeading';
import { TrailLayout } from '../components/trail/TrailLayout';
import { usePageTitle } from '../hooks/usePageTitle';

const CATEGORIES = [
  { id: 'extension', label: 'Extensions' },
  { id: 'app', label: 'Apps' },
  { id: 'webapp', label: 'Web Apps' },
  { id: 'program', label: 'Programs' },
] as const;

type Filter = 'all' | (typeof CATEGORIES)[number]['id'];

const allProjects: GearProject[] = [...config.projects].sort(
  (a, b) => b.id - a.id
);

export function ProjectsPage() {
  usePageTitle('Projects');
  const [filter, setFilter] = useState<Filter>('all');

  // 1件以上あるカテゴリだけ、絞り込みボタンを出す
  const available = useMemo(
    () =>
      CATEGORIES.filter((c) => allProjects.some((p) => p.category === c.id)),
    []
  );
  const shown = useMemo(
    () =>
      filter === 'all'
        ? allProjects
        : allProjects.filter((p) => p.category === filter),
    [filter]
  );

  return (
    <TrailLayout>
      <div className="flex flex-col gap-8">
        <PageHeading
          title="Projects"
          note={`Gear rack · ${shown.length} / ${allProjects.length}`}
        >
          これまでに作った Chrome 拡張・Android アプリ・プログラムです。
        </PageHeading>

        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">カテゴリで絞り込む</legend>
          {[{ id: 'all' as const, label: 'All' }, ...available].map((c) => (
            <button
              key={c.id}
              type="button"
              className="tg-chip"
              aria-pressed={filter === c.id}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
            </button>
          ))}
        </fieldset>

        <GearRack projects={shown} showGithub />
      </div>
    </TrailLayout>
  );
}
