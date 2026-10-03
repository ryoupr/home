import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface GearProject {
  id: number;
  title: string;
  description: string;
  tags: string[];
  category: string;
  detailUrl?: string;
  demoUrl?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  extension: 'Chrome Extension',
  app: 'Android App',
  webapp: 'Web App',
  program: 'Program',
};

/** レールに吊るした値札タグ風のプロジェクトカード。カーソルを乗せると揺れる */
export function GearTag({ project }: { project: GearProject }) {
  const { id, title, description, tags, category, detailUrl, demoUrl } =
    project;
  return (
    <div className="tg-hang">
      <article className="tg-tag flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="tg-display text-[1.5rem]">{title}</h3>
          <span className="tg-label whitespace-nowrap">
            No.{String(id).padStart(2, '0')}
          </span>
        </div>
        <span className="self-start bg-webbing px-2 py-0.5 font-mono text-[0.65rem] tracking-[0.08em] text-on-webbing uppercase">
          {CATEGORY_LABELS[category] ?? category}
        </span>
        <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
          {description}
        </p>
        <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-2 font-mono text-[0.7rem]">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        {(detailUrl || demoUrl) && (
          <div className="flex flex-wrap gap-2">
            {detailUrl ? (
              <Link to={detailUrl} className="tg-btn">
                Details <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            ) : (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tg-btn"
              >
                {category === 'extension' ? 'Web Store' : 'Demo'}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
