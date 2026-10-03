import { useEffect, useRef } from 'react';

/** 針がカーソルの方向を指すコンパス（装飾）。動きを減らす設定のときは止める */
export function Compass({ className = '' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const needleRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const needle = needleRef.current;
    if (!svg || !needle) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let current = 35;
    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const deg =
        (Math.atan2(
          e.clientY - (r.top + r.height / 2),
          e.clientX - (r.left + r.width / 2)
        ) *
          180) /
          Math.PI +
        90;
      // 最短回転方向に回す（359° → 1° で一周しないように）
      current += ((deg - current + 540) % 360) - 180;
      needle.style.transform = `rotate(${current}deg)`;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        strokeWidth="5"
        className="fill-surface stroke-ink transition-colors duration-500"
      />
      <g
        ref={needleRef}
        className="tg-needle"
        style={{ transform: 'rotate(35deg)' }}
      >
        <polygon points="50,13 57,50 43,50" className="fill-webbing" />
        <polygon points="50,87 57,50 43,50" className="fill-ink" />
        <circle cx="50" cy="50" r="5" className="fill-metal" />
      </g>
    </svg>
  );
}
