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
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/app/components/ui/card';

export function MyToolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to="/tools"
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              ← ツール一覧に戻る
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">マイツール</h1>

          <Card>
            <CardContent className="pt-6">{/* ツールの実装 */}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### 2. ルーティングの追加

`src/app/App.tsx` にルートを追加します。

```tsx
import { MyToolPage } from './pages/tools/MyToolPage';

// Routes内に追加
<Route path="/tools/mytool" element={<MyToolPage />} />;
```

### 3. ツール一覧への追加

`src/app/pages/ToolsPage.tsx` のツールカードを追加します。

```tsx
<div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900 mb-2">マイツール</h2>
  <p className="text-gray-600 mb-4">ツールの説明</p>
  <Link
    to="/tools/mytool"
    className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
  >
    ツールを開く
  </Link>
</div>
```

## アクセスURL

- ツール一覧: `https://ryoupr.github.io/home/tools/`
- 個別ツール: `https://ryoupr.github.io/home/tools/[tool-name]`

## スタイリングガイドライン

- Tailwind CSSユーティリティクラスを使用
- レスポンシブデザイン対応（モバイルファースト）
- ダークモード対応（`dark:` プレフィックス）
- アクセシビリティ準拠（WCAG 2.1 AA）

## 利用可能なUIコンポーネント

- `Card`, `CardContent` - カードレイアウト
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
