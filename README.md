# My Website

React + TypeScript + Vite で構築した個人ポートフォリオサイト。

## Features

- 📱 レスポンシブデザイン（モバイル、タブレット、デスクトップ）
- ♿ WCAG 2.1 AA アクセシビリティ準拠
- 🎨 Tailwind CSS 4.x によるモダンUI
- ⚡ Vite による高速ビルド
- 🚀 GitHub Pages 対応

## Tech Stack

- React 18.3.1
- TypeScript 5.x
- Vite 6.x
- Tailwind CSS 4.x
- React Router DOM
- Radix UI / Material-UI
- Lucide React

## Development

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# フォーマット
npm run format

# リント
npm run lint
```

## Customization

### 個人情報・プロジェクトの編集

`src/data/config.json` を編集：

```json
{
  "developer": {
    "name": "Your Name",
    "role": "Your Role",
    "bio": "Your bio..."
  },
  "projects": [...]
}
```

詳細は [docs/HOW_TO_EDIT.md](docs/HOW_TO_EDIT.md) を参照。

### 画像の追加

- `images/hero/` - アバター画像
- `images/projects/` - プロジェクトスクリーンショット
- `images/icons/` - アイコン（SVG推奨）

## Project Structure

```
.
├── src/                    # ソースコード
│   ├── main.tsx           # エントリーポイント
│   ├── app/               # アプリケーションコード
│   │   ├── components/    # Reactコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   └── hooks/         # カスタムフック
│   ├── data/              # データファイル
│   │   └── config.json    # サイト設定
│   └── styles/            # スタイルシート
├── images/                 # 画像アセット
├── docs/                   # ドキュメント
├── scripts/                # ビルドスクリプト
├── index.html             # HTMLエントリーポイント
├── vite.config.ts         # Vite設定
├── tailwind.config.js     # Tailwind設定
└── tsconfig.json          # TypeScript設定
```

## Deployment

```bash
npm run build
./deploy.sh
```

詳細は [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) を参照。

## Documentation

- [編集ガイド](docs/HOW_TO_EDIT.md)
- [デプロイガイド](docs/DEPLOYMENT.md)
- [コンテンツ管理](docs/CONTENT.md)
- [画像最適化ガイド](images/IMAGE_OPTIMIZATION_GUIDE.md)

## License

MIT
