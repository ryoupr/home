import { Link } from 'react-router-dom';
import type { ToolSymbol } from '../../../data/tools';
import { TOOLS } from '../../../data/tools';

/** 地図の凡例記号風のアイコン */
function LegendSymbol({ symbol }: { symbol: ToolSymbol }) {
  const common = {
    className: 'tg-sym',
    fill: 'none',
    strokeWidth: 2,
  } as const;
  return (
    <svg viewBox="0 0 40 26" className="h-[26px] w-10" aria-hidden="true">
      {symbol === 'chart' && (
        <path {...common} d="M3 22 L12 12 L20 17 L28 6 L37 10" />
      )}
      {symbol === 'icon' && (
        <>
          <rect {...common} x="10" y="3" width="20" height="20" rx="5" />
          <circle {...common} cx="20" cy="13" r="4" />
        </>
      )}
      {symbol === 'chevron' && (
        <>
          <path {...common} d="M3 6 H22 L28 11 L22 16 H3 Z" />
          <path {...common} d="M14 20 H33 L37 23" />
        </>
      )}
      {symbol === 'slide' && (
        <>
          <rect {...common} x="6" y="3" width="28" height="17" />
          <path {...common} d="M20 20 V24 M13 24 H27" />
        </>
      )}
      {symbol === 'convert' && (
        <path {...common} d="M4 9 H30 L25 4 M36 17 H10 L15 22" />
      )}
    </svg>
  );
}

/** WEB ツールの一覧を、地図の凡例のように並べる */
export function ToolsLegend() {
  return (
    <ul className="tg-panel">
      {TOOLS.map((tool) => (
        <li key={tool.path} className="border-t border-line first:border-t-0">
          <Link
            to={tool.path}
            className="tg-legend-row grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3.5 px-4 py-3"
          >
            <LegendSymbol symbol={tool.symbol} />
            <span className="min-w-0">
              <span className="block font-display text-[1.2rem] font-semibold tracking-[0.05em] uppercase">
                {tool.name}
              </span>
              <span className="block text-[0.8rem] leading-relaxed text-ink-muted">
                {tool.description}
              </span>
            </span>
            <span className="tg-go font-mono text-xs text-ink-muted">
              OPEN →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
