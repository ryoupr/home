# デプロイメントガイド

このドキュメントでは、ポートフォリオサイトをGitHub Pagesにデプロイする方法を説明します。

## 本番ビルドの作成

### 1. すべてのアセットをビルド

```bash
npm run build:all
```

このコマンドは以下を実行します：

- Tailwind CSSを最小化（`css/output.css`）
- すべてのJavaScriptファイルを最小化（`*.min.js`）
- 本番用HTMLファイルを生成（`index.prod.html`）

### 2. ビルド結果の確認

以下のファイルが生成されていることを確認：

- `css/output.css` - 最小化されたCSS
- `js/**/*.min.js` - 最小化されたJavaScriptファイル
- `index.prod.html` - 最小化されたアセットを参照するHTML

### 3. 本番HTMLの適用

```bash
# 開発用HTMLをバックアップ
cp index.html index.dev.html

# 本番HTMLを適用
cp index.prod.html index.html
```

## GitHub Pagesへのデプロイ

### 方法1: GitHub Actionsを使用（推奨）

`.github/workflows/deploy.yml`を作成：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build assets
        run: npm run build:all
      
      - name: Apply production HTML
        run: cp index.prod.html index.html
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          exclude_assets: 'node_modules,scripts,.git*,*.dev.html,*.prod.html'
```

### 方法2: 手動デプロイ

1. ビルドを実行：

```bash
npm run build:all
cp index.prod.html index.html
```

1. 変更をコミット：

```bash
git add .
git commit -m "Build for production"
git push origin main
```

1. GitHubリポジトリの設定：
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

## カスタムドメインの設定

### 1. CNAMEファイルの作成

```bash
echo "yourdomain.com" > CNAME
```

### 2. DNSレコードの設定

ドメインプロバイダーで以下のレコードを追加：

**Aレコード（Apex domain用）:**

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAMEレコード（www用）:**

```
www.yourdomain.com → username.github.io
```

### 3. GitHubでカスタムドメインを設定

- Settings → Pages → Custom domain
- ドメイン名を入力
- "Enforce HTTPS"を有効化

## デプロイ前のチェックリスト

- [ ] すべてのテストが通過している
- [ ] 画像が最適化されている
- [ ] `npm run build:all`が正常に完了
- [ ] ローカルで本番ビルドをテスト（`npm run dev`）
- [ ] アクセシビリティ監査を実行（Lighthouse）
- [ ] 複数のブラウザでテスト
- [ ] モバイルデバイスでテスト
- [ ] すべてのリンクが機能している
- [ ] 個人情報（メールアドレス、ソーシャルメディアリンク）を更新

## トラブルシューティング

### CSSが適用されない

- `css/output.css`が生成されているか確認
- `npm run build`を再実行
- ブラウザのキャッシュをクリア

### JavaScriptが動作しない

- ブラウザのコンソールでエラーを確認
- `*.min.js`ファイルが生成されているか確認
- `npm run build:js`を再実行

### 画像が表示されない

- 画像パスが正しいか確認（相対パス使用）
- 画像ファイルがコミットされているか確認
- ブラウザのネットワークタブでエラーを確認

### GitHub Pagesで404エラー

- `index.html`がルートディレクトリにあるか確認
- GitHub Pages設定でブランチが正しいか確認
- デプロイが完了するまで数分待つ

## パフォーマンス最適化

### ビルド後のサイズ確認

```bash
# CSSサイズ
ls -lh css/output.css

# JavaScriptサイズ
find js -name "*.min.js" -exec ls -lh {} \;

# 合計サイズ
du -sh .
```

### 目標サイズ

- CSS: < 50KB
- JavaScript（合計）: < 100KB
- 画像（合計）: < 500KB
- 合計ページサイズ: < 1MB

## 継続的な更新

### プロジェクトの追加

1. `js/data/projects.js`を編集
2. プロジェクト画像を`images/projects/`に追加
3. ビルドとデプロイ

### 個人情報の更新

1. `js/config.js`を編集
2. `index.html`のメタタグを更新
3. ビルドとデプロイ

## サポート

問題が発生した場合：

1. ブラウザのコンソールでエラーを確認
2. GitHub Actionsのログを確認（自動デプロイの場合）
3. [GitHub Pages ドキュメント](https://docs.github.com/pages)を参照
