import { type RefObject, useEffect, useRef } from 'react';
import { useMode } from '../../theme/mode';
import { buildContours, elevationAt } from './terrain';

interface TopoBackgroundProps {
  /** カーソル位置の標高を書き込む要素（毎フレーム再描画しないよう、React の state を通さず直接更新する） */
  elevationRef?: RefObject<HTMLElement>;
}

const numberFormat = new Intl.NumberFormat('en-US');

/**
 * 画面に固定した等高線の背景。
 * 薄い等高線（base）と、カーソルの周りだけ見える濃い等高線（spot）の2枚のキャンバスを重ねる。
 * 等高線はサイズ変更・昼夜切り替えのときだけ描き直し、カーソル移動ではマスク位置だけを動かす。
 */
export function TopoBackground({ elevationRef }: TopoBackgroundProps) {
  const baseRef = useRef<HTMLCanvasElement>(null);
  const spotRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useMode();

  // 等高線の描画
  // 等高線の色は CSS 変数から読むため、昼夜切り替え（mode）で描き直す
  useEffect(() => {
    const base = baseRef.current;
    const spot = spotRef.current;
    if (!base || !spot) return;

    let timer: number | undefined;
    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      const color = getComputedStyle(base).getPropertyValue('--tg-topo').trim();
      const { minor, major, peak } = buildContours(w, h);
      const night = mode === 'night';
      const layers: [HTMLCanvasElement, number][] = [
        [base, night ? 0.16 : 0.2],
        [spot, night ? 0.85 : 0.75],
      ];
      for (const [canvas, alpha] of layers) {
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = color || '#8a5a2b';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 0.8;
        ctx.stroke(minor);
        ctx.lineWidth = 1.7;
        ctx.stroke(major);
        // 山頂の三角点と標高
        ctx.globalAlpha = Math.min(1, alpha * 3);
        ctx.beginPath();
        ctx.moveTo(peak.x, peak.y - 6);
        ctx.lineTo(peak.x + 6, peak.y + 4);
        ctx.lineTo(peak.x - 6, peak.y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillText(
          numberFormat.format(Math.round(peak.elevation)),
          peak.x + 9,
          peak.y + 4
        );
      }
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 150);
    };

    draw();
    window.addEventListener('resize', schedule);
    // 三角点のラベルの書体を、読み込み完了後に反映する
    document.fonts?.ready.then(draw).catch(() => undefined);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', schedule);
    };
  }, [mode]);

  // カーソル → スポットライト位置と標高表示
  useEffect(() => {
    const spot = spotRef.current;
    if (!spot) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      spot.style.setProperty('--mx', `${e.clientX}px`);
      spot.style.setProperty('--my', `${e.clientY}px`);
      const el = elevationRef?.current;
      if (el) {
        el.textContent = numberFormat.format(
          Math.round(elevationAt(e.clientX, e.clientY))
        );
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [elevationRef]);

  return (
    <>
      <canvas ref={baseRef} className="tg-topo" aria-hidden="true" />
      <canvas
        ref={spotRef}
        className="tg-topo tg-topo-spot"
        aria-hidden="true"
      />
    </>
  );
}
