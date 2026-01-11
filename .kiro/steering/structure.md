---
inclusion: always
---

# プロジェクト構造

## ディレクトリ概要

| パス                     | 用途                               |
| ------------------------ | ---------------------------------- |
| `src/app/pages/`         | ページコンポーネント（ルート単位） |
| `src/app/components/`    | 再利用可能なコンポーネント         |
| `src/app/components/ui/` | 汎用UIプリミティブ（Radix UI）     |
| `src/app/hooks/`         | カスタムReactフック                |
| `src/data/`              | 静的データ（config.json）          |
| `src/styles/`            | スタイルシート                     |
| `images/`                | 画像アセット                       |
| `scripts/`               | ビルド・検証スクリプト             |

## ファイル配置ルール

- 新規ページ → `src/app/pages/[PageName].tsx`
- 新規コンポーネント → `src/app/components/[ComponentName].tsx`
- 新規フック → `src/app/hooks/use[HookName].ts`
- 画像追加 → `images/[category]/` （hero, projects, icons）
- コンテンツ変更 → `src/data/config.json` のみ編集

## アーキテクチャパターン

### コンポーネント階層

```
Pages → Components → UI Components
         ↓
       Hooks
```

- Pages: ルーティング対象、データ取得・状態管理
- Components: ビジネスロジック、レイアウト
- UI Components: プレゼンテーションのみ、再利用性重視

### ルーティング

- `src/app/App.tsx` でReact Router DOMを使用
- 現在のルート: `/`（ProfilePage）、`/projects`（ProjectsPage）

### データフロー

- `src/data/config.json` が唯一の真実の情報源
- コンポーネントでJSONを直接インポート

## 命名規則

| 対象           | 規則                            | 例                  |
| -------------- | ------------------------------- | ------------------- |
| コンポーネント | PascalCase                      | `ProjectCard.tsx`   |
| フック         | camelCase + `use`プレフィックス | `useGitHubStats.ts` |
| 設定ファイル   | kebab-case                      | `config.json`       |
| CSS変数        | kebab-case                      | `--primary-color`   |

## スタイリング規約

- Tailwind CSSユーティリティクラスを優先
- カスタムカラー: `primary-*`, `secondary-*`, `accent-*`
- アニメーション: `animate-fade-in`, `animate-slide-up`, `animate-slide-down`, `animate-scale-in`
- レスポンシブ: モバイルファースト（`sm:` → `md:` → `lg:` → `xl:`）

## インポートパス

- `@/*` → `./src/*` エイリアス使用
- 例: `import { Button } from '@/app/components/ui/button'`

## 重要ファイル

- `src/data/config.json` - コンテンツ管理
- `src/app/App.tsx` - ルーティング定義
- `tailwind.config.js` - テーマ・カラー定義
- `vite.config.ts` - ビルド設定・パスエイリアス
