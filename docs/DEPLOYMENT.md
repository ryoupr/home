# デプロイメントガイド

このドキュメントでは、ポートフォリオサイトをGitHub Pagesにデプロイする方法を説明します。

## 本番ビルドの作成

### ビルドコマンド

```bash
npm run build
```

このコマンドはViteを使用して以下を実行します：

- TypeScript/TSXファイルのトランスパイル
- Reactコンポーネントのバンドル
- Tailwind CSSの最適化
- アセットの最小化
- `dist/` ディレクトリへの出力

### ビルド結果の確認

```bash
# ビルド結果をローカルでプレビュー
npm run preview
```

ブラウザで `http://localhost:4173` を開いて確認できます。

## GitHub Pagesへのデプロイ

### 方法1: デプロイスクリプト（推奨）

```bash
./deploy.sh
```

このスクリプトが自動的にビルドとデプロイを実行します。

### 方法2: 手動デプロイ

```bash
# 1. 本番用ビルド
npm run build

# 2. GitHubにプッシュ
git add .
git commit -m "Update site"
git push origin main
```

GitHub Actionsが自動的にデプロイを実行します。

### 方法3: GitHub Actions（自動デプロイ）

`.github/workflows/deploy.yml` が設定済みです。`main` ブランチへのプッシュで自動デプロイされます。

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

- [ ] `npm run build` が正常に完了
- [ ] `npm run preview` でローカル確認
- [ ] アクセシビリティ監査を実行（Lighthouse）
- [ ] 複数のブラウザでテスト
- [ ] モバイルデバイスでテスト
- [ ] すべてのリンクが機能している
- [ ] 個人情報（メールアドレス、ソーシャルメディアリンク）を更新

## トラブルシューティング

### ビルドエラー

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# 再ビルド
npm run build
```

### CSSが適用されない

- ブラウザのキャッシュをクリア
- `dist/` ディレクトリを削除して再ビルド

### JavaScriptが動作しない

- ブラウザのコンソールでエラーを確認
- `vite.config.ts` の `base` 設定を確認（GitHub Pagesの場合は `/home/`）

### GitHub Pagesで404エラー

- GitHub Pages設定でブランチが正しいか確認（`gh-pages` ブランチ）
- デプロイが完了するまで数分待つ
- `deploy.sh` を再実行

## パフォーマンス最適化

### ビルド後のサイズ確認

```bash
# ビルド結果のサイズ
du -sh dist/
```

### 目標サイズ

- 初回ロード: < 200KB (gzip圧縮後)
- 合計バンドルサイズ: < 500KB

### 最適化のヒント

- 画像を最適化（WebP形式推奨）
- 不要な依存関係を削除
- コード分割を活用（React.lazy）

## 継続的な更新

### コンテンツの更新

1. `src/data/config.json` を編集
2. ローカルで確認（`npm run dev`）
3. ビルドとデプロイ（`./deploy.sh`）

### コンポーネントの追加

1. `src/app/components/` に新しいコンポーネントを作成
2. 必要に応じてページに追加
3. ビルドとデプロイ

## サポート

問題が発生した場合：

1. ブラウザのコンソールでエラーを確認
2. GitHub Actionsのログを確認
3. [Vite ドキュメント](https://vitejs.dev/)を参照
4. [GitHub Pages ドキュメント](https://docs.github.com/pages)を参照
