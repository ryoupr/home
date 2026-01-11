---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.css']
---

# 技術スタック

## コア技術

| カテゴリ       | 技術             | バージョン |
| -------------- | ---------------- | ---------- |
| ビルド         | Vite             | 最新       |
| 言語           | TypeScript       | 5.x        |
| UI             | React            | 18.3.1     |
| ルーティング   | React Router DOM | 最新       |
| スタイリング   | Tailwind CSS     | 4.x        |
| パッケージ管理 | npm              | -          |

## UIライブラリ優先順位

コンポーネント実装時は以下の順序で検討すること：

1. **Radix UI** - アクセシブルなプリミティブ（優先）
2. **Lucide React** - アイコン
3. **Sonner** - トースト通知
4. **Motion (Framer Motion)** - アニメーション

## スタイリング規約

### Tailwind CSS使用ルール

- ユーティリティクラスを優先、カスタムCSSは最小限に
- カスタムカラー: `primary-*`, `secondary-*`, `accent-*`
- アニメーション: `animate-fade-in`, `animate-slide-up`, `animate-slide-down`, `animate-scale-in`
- レスポンシブ: モバイルファースト（`sm:` → `md:` → `lg:` → `xl:`）

### 禁止事項

- インラインスタイル（`style={}`）の使用
- `!important`の使用
- グローバルCSSの追加（`src/styles/`以外）

## インポート規約

### パスエイリアス

`@/*` → `./src/*` を必ず使用すること

```typescript
// Good
import { Button } from '@/app/components/ui/button';
import config from '@/data/config.json';

// Bad
import { Button } from '../../../components/ui/button';
```

### インポート順序

1. React/外部ライブラリ
2. `@/app/components/ui/*`（UIプリミティブ）
3. `@/app/components/*`（カスタムコンポーネント）
4. `@/app/hooks/*`
5. `@/data/*`
6. 型定義

## コマンドリファレンス

| 目的         | コマンド          |
| ------------ | ----------------- |
| 開発サーバー | `npm run dev`     |
| 本番ビルド   | `npm run build`   |
| ビルド確認   | `npm run preview` |
| フォーマット | `npm run format`  |
| リント       | `npm run lint`    |
| デプロイ     | `./deploy.sh`     |

## 型定義ルール

- `any`型の使用禁止
- コンポーネントpropsは必ず型定義
- イベントハンドラは適切なReact型を使用

```typescript
// Good
interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

// Bad
interface ButtonProps {
  onClick: any;
  children: any;
}
```

## アクセシビリティ要件

- WCAG 2.1 AA準拠必須
- インタラクティブ要素には適切なaria属性を付与
- キーボードナビゲーション対応
- カラーコントラスト比4.5:1以上
