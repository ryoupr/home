/**
 * 架空の地形（標高）と等高線を生成する。
 *
 * 等高線の間隔は国土地理院の 5万分1地形図に合わせている（主曲線 20m・計曲線 100m）。
 * https://www.gsi.go.jp/KIDS/map-sign-tizukigou-2022-syukyokusen.htm
 * https://www.gsi.go.jp/KIDS/map-sign-tizukigou-2022-keikyokusen.htm
 */

export const MINOR_INTERVAL_M = 20;
export const MAJOR_INTERVAL_M = 100;

const NOISE_SIZE = 64;
const SEED = 20261003;

/** シード固定の疑似乱数（mulberry32）。毎回同じ地形にするため */
function createRandom(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const grid = (() => {
  const rand = createRandom(SEED);
  const g = new Float32Array(NOISE_SIZE * NOISE_SIZE);
  for (let i = 0; i < g.length; i++) g[i] = rand();
  return g;
})();

const smooth = (t: number) => t * t * (3 - 2 * t);
const wrap = (n: number) => ((n % NOISE_SIZE) + NOISE_SIZE) % NOISE_SIZE;

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = smooth(x - xi);
  const fy = smooth(y - yi);
  const x0 = wrap(xi);
  const y0 = wrap(yi);
  const x1 = wrap(x0 + 1);
  const y1 = wrap(y0 + 1);
  const a = grid[y0 * NOISE_SIZE + x0];
  const b = grid[y0 * NOISE_SIZE + x1];
  const c = grid[y1 * NOISE_SIZE + x0];
  const d = grid[y1 * NOISE_SIZE + x1];
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** 画面上の座標（CSS px）の標高（m） */
export function elevationAt(px: number, py: number) {
  const x = px / 300;
  const y = py / 300;
  const h =
    valueNoise(x, y) * 0.6 +
    valueNoise(x * 2.1 + 5, y * 2.1 + 9) * 0.28 +
    valueNoise(x * 4.3 + 11, y * 4.3 + 3) * 0.12;
  return 820 + h * 900;
}

export interface Contours {
  minor: Path2D;
  major: Path2D;
  peak: { x: number; y: number; elevation: number };
}

/** 幅 w・高さ h の範囲の等高線をマーチングスクエア法で作る */
export function buildContours(w: number, h: number, step = 6): Contours {
  const cols = Math.ceil(w / step) + 1;
  const rows = Math.ceil(h / step) + 1;
  const v = new Float32Array(cols * rows);
  let max = -Infinity;
  let maxAt = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const e = elevationAt(c * step, r * step);
      v[r * cols + c] = e;
      if (e > max) {
        max = e;
        maxAt = r * cols + c;
      }
    }
  }

  const minor = new Path2D();
  const major = new Path2D();
  const t = (a: number, b: number, level: number) => (level - a) / (b - a);

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = v[r * cols + c];
      const b = v[r * cols + c + 1];
      const d = v[(r + 1) * cols + c];
      const cc = v[(r + 1) * cols + c + 1];
      const lo = Math.min(a, b, cc, d);
      const hi = Math.max(a, b, cc, d);
      const x = c * step;
      const y = r * step;
      for (
        let level = Math.ceil(lo / MINOR_INTERVAL_M) * MINOR_INTERVAL_M;
        level <= hi;
        level += MINOR_INTERVAL_M
      ) {
        const pts: [number, number][] = [];
        if (a < level !== b < level) pts.push([x + step * t(a, b, level), y]);
        if (b < level !== cc < level)
          pts.push([x + step, y + step * t(b, cc, level)]);
        if (d < level !== cc < level)
          pts.push([x + step * t(d, cc, level), y + step]);
        if (a < level !== d < level) pts.push([x, y + step * t(a, d, level)]);
        const path = level % MAJOR_INTERVAL_M === 0 ? major : minor;
        for (let k = 0; k + 1 < pts.length; k += 2) {
          path.moveTo(pts[k][0], pts[k][1]);
          path.lineTo(pts[k + 1][0], pts[k + 1][1]);
        }
      }
    }
  }

  return {
    minor,
    major,
    peak: {
      x: (maxAt % cols) * step,
      y: Math.floor(maxAt / cols) * step,
      elevation: max,
    },
  };
}
