# プロジェクト構造

## ディレクトリ構成

```
.
├── src/                      # ソースコード（React/TypeScript）
│   ├── main.tsx             # エントリーポイント
│   ├── app/                 # アプリケーションコード
│   │   ├── App.tsx          # ルートコンポーネント（ルーティング設定）
│   │   ├── components/      # Reactコンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── figma/       # Figma連携コンポーネント
│   │   │   └── ui/          # 再利用可能なUIコンポーネント（Radix UI等）
│   │   ├── hooks/           # カスタムReactフック
│   │   │   └── useGitHubStats.ts
│   │   └── pages/           # ページコンポーネント
│   │       ├── ProfilePage.tsx
│   │       └── ProjectsPage.tsx
│   ├── data/                # データファイル
│   │   └── config.json      # サイト設定・コンテンツ（個人情報、プロジェクト）
│   └── styles/              # スタイルシート
│       ├── index.css        # メインスタイル
│       ├── tailwind.css     # Tailwindディレクティブ
│       ├── theme.css        # テーマ設定
│       └── fonts.css        # フォント設定
│
├── images/                   # 画像アセット
│   ├── hero/                # ヒーローセクション画像
│   ├── projects/            # プロジェクトスクリーンショット
│   └── icons/               # アイコンファイル（SVG推奨）
│
├── dist/                     # ビルド出力（Viteが生成）
├── assets/                   # ビルド済みアセット
│
├── scripts/                  # ビルドスクリプト
│   ├── minify-js.js
│   └── create-production-html.js
│
├── .kiro/                    # Kiro設定
│   └── steering/            # ステアリングルール
│
├── index.html               # HTMLエントリーポイント
├── vite.config.ts           # Vite設定
├── tailwind.config.js       # Tailwind CSS設定
├── tsconfig.json            # TypeScript設定
├── package.json             # npm設定
└── README.md                # プロジェクトドキュメント
```

## アーキテクチャパターン

### コンポーネント構成

- **Pages** (`src/app/pages/`) - ルートレベルのページコンポーネント
- **Components** (`src/app/components/`) - 再利用可能なUIコンポーネント
- **UI Components** (`src/app/components/ui/`) - 汎用UIプリミティブ（Radix UI等）
- **Hooks** (`src/app/hooks/`) - カスタムReactフック

### ルーティング

- React Router DOMを使用
- `App.tsx`でルート定義
- 現在のルート:
  - `/` - プロフィールページ
  - `/projects` - プロジェクト一覧ページ

### データ管理

- `src/data/config.json` - 静的データ（個人情報、プロジェクト）
- コンポーネント内でJSONをインポートして使用

### スタイリング規約

- Tailwind CSSのユーティリティクラスを優先
- カスタムカラー: `primary-*`, `secondary-*`, `accent-*`
- カスタムアニメーション: `animate-fade-in`, `animate-slide-up`, `animate-slide-down`, `animate-scale-in`
- レスポンシブ: モバイルファースト（`sm:`, `md:`, `lg:`, `xl:`）

## 命名規則

- **コンポーネント**: PascalCase（例: `ProjectCard.tsx`）
- **フック**: camelCase、`use`プレフィックス（例: `useGitHubStats.ts`）
- **ファイル**: kebab-case（設定ファイル）、PascalCase（コンポーネント）
- **CSS**: Tailwindユーティリティクラス使用

## 重要なファイル

- `src/data/config.json` - サイトコンテンツの唯一の真実の情報源
- `vite.config.ts` - ビルド設定、パスエイリアス設定
- `tailwind.config.js` - カスタムテーマ、カラー、アニメーション定義
- `tsconfig.json` - TypeScript設定、パスエイリアス
