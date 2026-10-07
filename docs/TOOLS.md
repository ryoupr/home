# WEBツール管理ガイド

## 概要

`/home/tools/` 配下でReactベースのWEBツールを公開できます。

## ディレクトリ構造

```
src/app/pages/tools/
├── [ToolName]Page.tsx  # 個別ツールページ
```

## 新規ツールの追加手順

### 1. ツールページの作成

`src/app/pages/tools/` に新しいツールページを作成します。

```tsx
// src/app/pages/tools/MyToolPage.tsx
import { PageHeading } from '../../components/trail/PageHeading';
import { TrailLayout } from '../../components/trail/TrailLayout';
import { usePageTitle } from '../../hooks/usePageTitle';

export function MyToolPage() {
  usePageTitle('My Tool');
  return (
    <TrailLayout>
      <div className="flex flex-col gap-6">
        <PageHeading title="My Tool" back={{ to: '/tools', label: 'Tools' }}>
          ツールの説明
        </PageHeading>
        <section className="tg-panel p-6">{/* ツールの実装 */}</section>
      </div>
    </TrailLayout>
  );
}
```

`src/app/pages/tools/SampleToolPage.tsx` がそのまま使えるひな形です。
画面いっぱいを使うツール（エディタなど）は `<TrailLayout variant="app">` にします。

### 2. ルーティングの追加

`src/app/App.tsx` にルートを追加します。

```tsx
import { MyToolPage } from './pages/tools/MyToolPage';

// Routes内に追加
<Route path="/tools/mytool" element={<MyToolPage />} />;
```

### 3. ツール一覧への追加

ツール一覧ページ（`/tools`）とトップページの「TOOLS（凡例）」は、どちらも `src/data/tools.ts` の `TOOLS` 配列から表示されます。
`path`・`name`・`description`・`symbol`（凡例記号）・`tags` を追加してください。

## アクセスURL

- ツール一覧: `https://ryoupr.github.io/home/tools/`
- 個別ツール: `https://ryoupr.github.io/home/tools/[tool-name]`

## スタイリングガイドライン

- Tailwind CSSユーティリティクラスを使用
- 色は `src/styles/theme.css` の Trail Gear トークンだけを使う（`bg-ground` / `bg-surface` / `text-ink` / `text-ink-muted` / `border-line` / `bg-webbing` / `text-legend` など）。`bg-white` や `text-slate-900` のような固定色は、夜モードで読めなくなるため使わない（エラー表示の赤など意味のある色と、グラフ・アイコンの配色データは除く）
- 部品は `src/styles/trail-gear.css` のクラス（`tg-panel` / `tg-btn` / `tg-btn-ghost` / `tg-chip` / `tg-display` / `tg-label`）を使う
- レスポンシブデザイン対応（モバイルファースト）
- 昼/夜モードは `<html data-mode>` で切り替わり、トークンの値が変わる。`dark:` プレフィックスは使わない
- アクセシビリティ準拠（WCAG 2.1 AA）

## 利用可能なUIコンポーネント

- Trail Gear の共通部品（`src/app/components/trail/`）: `TrailLayout`・`PageHeading`。枠付きの面は `Card` ではなく `tg-panel` クラスを使う
- `Button` - ボタン
- `Input` - 入力フィールド
- `Select` - セレクトボックス
- `Dialog` - モーダルダイアログ
- その他Radix UIコンポーネント（`src/app/components/ui/` 参照）

## デプロイ

```bash
npm run build
./deploy.sh
```

ビルド後、GitHub Pagesに自動デプロイされます。
