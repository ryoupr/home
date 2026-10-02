/**
 * ビルド後に、外部から直接リンクされるルートへ dist/index.html のコピーを配置する。
 *
 * GitHub Pages では深いパスへの直アクセスは 404.html（SPA フォールバック）経由になり、
 * ブラウザでは表示できても HTTP ステータスは 404 になる。Chrome ウェブストアなどの
 * URL 到達性チェックはこれを「アクセスできない」と判定するため、
 * 対象ルートには実体の index.html を置いて 200 を返すようにする。
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

// 外部（ストア申請など）から直接参照されるルート。basename (/home) は含めない。
const ROUTES = [
  'projects/magdisplay',
  'projects/magdisplay/privacy',
  'projects/btn-locker',
  'projects/btn-locker/privacy',
];

const src = join(DIST, 'index.html');
if (!existsSync(src)) {
  console.error(
    'emit-route-html: dist/index.html not found. Run vite build first.'
  );
  process.exit(1);
}

for (const route of ROUTES) {
  const dir = join(DIST, route);
  mkdirSync(dir, { recursive: true });
  copyFileSync(src, join(dir, 'index.html'));
  console.log(`emit-route-html: dist/${route}/index.html`);
}
