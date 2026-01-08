# 技術スタック

## ビルドシステム

- **Vite** - 高速なビルドツール、開発サーバー
- **TypeScript** - 型安全なJavaScript
- **npm** - パッケージマネージャー

## フロントエンド

### コアライブラリ

- **React 18.3.1** - UIライブラリ
- **React Router DOM** - クライアントサイドルーティング
- **TypeScript 5.x** - 型システム

### スタイリング

- **Tailwind CSS 4.x** - ユーティリティファーストCSSフレームワーク
- **@tailwindcss/vite** - Vite統合
- カスタムカラースキーム（primary, secondary, accent）
- カスタムアニメーション（fade-in, slide-up, slide-down, scale-in）

### UIコンポーネント

- **Radix UI** - アクセシブルなプリミティブコンポーネント
- **Material-UI (MUI)** - Reactコンポーネントライブラリ
- **Lucide React** - アイコンライブラリ
- **Sonner** - トースト通知

### アニメーション

- **Motion (Framer Motion)** - アニメーションライブラリ
- Tailwindカスタムアニメーション

### その他

- **React Hook Form** - フォーム管理
- **date-fns** - 日付操作
- **recharts** - チャートライブラリ

## 開発ツール

- **ESLint** - コードリンター
- **Prettier** - コードフォーマッター

## よく使うコマンド

### 開発

```bash
# 開発サーバー起動（ホットリロード有効）
npm run dev

# ビルド（本番用）
npm run build

# プレビュー（ビルド後の確認）
npm run preview
```

### コード品質

```bash
# コードフォーマット
npm run format

# JavaScript/TypeScriptのリント
npm run lint
```

### デプロイ

```bash
# 本番ビルド実行
npm run build

# GitHub Pagesへデプロイ（手動）
./deploy.sh
```

## パス設定

- `@/*` → `./src/*` - TypeScriptパスエイリアス設定済み
- 例: `import { Component } from '@/app/components/Component'`

## ブラウザサポート

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）
- モバイルブラウザ（iOS Safari、Chrome Mobile）
