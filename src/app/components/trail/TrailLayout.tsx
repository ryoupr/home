import { Moon, Sun } from 'lucide-react';
import { type ReactNode, type RefObject, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '../../../data/config.json';
import { useMode } from '../../theme/mode';
import { Compass } from './Compass';
import { TopoBackground } from './TopoBackground';
import { MAJOR_INTERVAL_M, MINOR_INTERVAL_M } from './terrain';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/tools', label: 'Tools' },
] as const;

interface TrailLayoutProps {
  children: ReactNode;
  /**
   * page: 読み物のページ（幅を絞り、フッターあり）。
   * app: 画面いっぱいを使うツール（全幅・画面の高さに固定し、中身が自分でスクロールする。フッターなし）。
   */
  variant?: 'page' | 'app';
}

/**
 * Trail Gear デザインの共通レイアウト（等高線の背景・ヘッダー・フッター）。
 * トップ・Projects・Tools とその配下のページの外枠として使う。
 * 成果物の詳細ページ（MagDisplay・btn-locker など）は、成果物ごとのデザインで個別に組むため使わない。
 */
export function TrailLayout({ children, variant = 'page' }: TrailLayoutProps) {
  const elevationRef = useRef<HTMLElement>(null);

  if (variant === 'app') {
    return (
      <div className="theme-trail flex h-dvh min-h-0 flex-col overflow-hidden">
        <TopoBackground elevationRef={elevationRef} />
        <div className="tg-content px-4 sm:px-6">
          <SiteHeader elevationRef={elevationRef} compact />
        </div>
        <main className="tg-content flex min-h-0 flex-1 flex-col">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="theme-trail">
      <TopoBackground elevationRef={elevationRef} />
      <div className="tg-content mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-7">
        <SiteHeader elevationRef={elevationRef} />
        <main className="flex-1 py-10">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}

function SiteHeader({
  elevationRef,
  compact = false,
}: {
  elevationRef: RefObject<HTMLElement>;
  compact?: boolean;
}) {
  const { personal } = config;
  const { pathname } = useLocation();
  const { mode, toggle } = useMode();
  const isNight = mode === 'night';

  return (
    <header
      className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b-[1.5px] border-ink ${compact ? 'py-2' : 'py-4'}`}
    >
      <Link to="/" className="flex items-center gap-3">
        <Compass className={`flex-none ${compact ? 'size-8' : 'size-11'}`} />
        <span>
          <span
            className={`tg-display block tracking-[0.05em] ${compact ? 'text-lg' : 'text-[1.375rem]'}`}
          >
            {personal.name}
          </span>
          <span className="tg-label block">{personal.role} · ryoupr</span>
        </span>
      </Link>

      <nav aria-label="サイト" className="flex gap-5">
        {NAV_ITEMS.map(({ to, label }) => {
          const current =
            to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="tg-nav-link font-display text-base font-semibold uppercase tracking-[0.1em]"
              aria-current={current ? 'page' : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <p
          className="hidden min-w-[15em] border border-line bg-surface px-2.5 py-1 text-center font-mono text-[0.7rem] text-ink-muted tabular-nums transition-colors duration-500 md:block"
          title="カーソル位置の標高（架空の地形）"
        >
          ELEV{' '}
          <b ref={elevationRef} className="font-semibold text-ink">
            —
          </b>{' '}
          m · 主曲線 {MINOR_INTERVAL_M}m
        </p>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={isNight}
          aria-label={isNight ? '昼の表示に切り替える' : '夜の表示に切り替える'}
          className="inline-flex border-[1.5px] border-ink bg-surface font-mono text-[0.7rem] transition-colors duration-500"
        >
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 ${isNight ? '' : 'bg-ink text-ground'}`}
          >
            <Sun className="size-3" aria-hidden="true" />
            DAY
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 ${isNight ? 'bg-ink text-ground' : ''}`}
          >
            <Moon className="size-3" aria-hidden="true" />
            NIGHT
          </span>
        </button>
      </div>
    </header>
  );
}

function SiteFooter() {
  const { personal } = config;
  return (
    <footer className="flex flex-wrap justify-between gap-2 border-t-[1.5px] border-ink py-4 font-mono text-[0.7rem] text-ink-muted">
      <span>
        © {new Date().getFullYear()} {personal.name}
      </span>
      <span>
        MAP · 主曲線 {MINOR_INTERVAL_M}m / 計曲線 {MAJOR_INTERVAL_M}m
      </span>
    </footer>
  );
}
