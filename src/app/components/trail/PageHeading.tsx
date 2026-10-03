import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeadingProps {
  title: string;
  /** 見出しの上に出す「戻り先」（例: Tools 一覧） */
  back?: { to: string; label: string };
  /** 見出し横の小さなラベル（例: 件数） */
  note?: string;
  children?: ReactNode;
}

/** Trail Gear の各ページの見出し（パンくず・タイトル・説明） */
export function PageHeading({ title, back, note, children }: PageHeadingProps) {
  return (
    <div className="flex flex-col gap-2">
      {back && (
        <Link
          to={back.to}
          className="tg-nav-link tg-label self-start hover:text-ink"
        >
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="tg-display text-[clamp(2rem,5vw,3rem)] leading-none tracking-[0.04em]">
          {title}
        </h1>
        {note && <span className="tg-label">{note}</span>}
      </div>
      {children && (
        <div className="max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-muted">
          {children}
        </div>
      )}
    </div>
  );
}
