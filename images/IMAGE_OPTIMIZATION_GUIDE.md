# 画像最適化ガイド

このガイドでは、ポートフォリオサイトで使用する画像の最適化方法を説明します。

## 推奨される画像サイズ

### ヒーローセクション

- **アバター画像**: 320x320px (表示サイズ: 128-160px)
- **フォーマット**: WebP (フォールバック: JPG)
- **品質**: 85%

### プロジェクト画像

- **サムネイル**: 800x450px (16:9 アスペクト比)
- **フォーマット**: WebP (フォールバック: JPG)
- **品質**: 80%

### アイコン

- **ソーシャルメディアアイコン**: 32x32px または 64x64px
- **フォーマット**: SVG (推奨) または PNG
- **最適化**: SVGOMGを使用してSVGを最適化

## 画像最適化ツール

### オンラインツール

- **Squoosh**: <https://squoosh.app/> (WebP変換、圧縮)
- **TinyPNG**: <https://tinypng.com/> (PNG/JPG圧縮)
- **SVGOMG**: <https://jakearchibald.github.io/svgomg/> (SVG最適化)

### コマンドラインツール

```bash
# ImageMagickを使用した画像リサイズと圧縮
convert input.jpg -resize 800x450 -quality 80 output.jpg

# cwebpを使用したWebP変換
cwebp -q 80 input.jpg -o output.webp

# svgoを使用したSVG最適化
npx svgo input.svg -o output.svg
```

## WebPフォールバック実装

HTMLで`<picture>`要素を使用してWebPとフォールバックを提供：

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="説明" loading="lazy">
</picture>
```

## 画像配置ガイドライン

### ディレクトリ構造

```
images/
├── hero/
│   ├── avatar.webp
│   └── avatar.jpg (フォールバック)
├── projects/
│   ├── project1.webp
│   ├── project1.jpg (フォールバック)
│   └── placeholder.jpg (エラー時のフォールバック)
└── icons/
    ├── github.svg
    ├── twitter.svg
    ├── linkedin.svg
    └── email.svg
```

## パフォーマンス目標

- **画像サイズ**: 各画像は100KB以下を目標
- **合計画像サイズ**: ページ全体で500KB以下
- **フォーマット**: 可能な限りWebPを使用
- **遅延読み込み**: fold以下の画像には`loading="lazy"`を使用

## チェックリスト

- [ ] すべての画像を適切なサイズにリサイズ
- [ ] すべての画像を圧縮（品質80-85%）
- [ ] WebPフォーマットに変換（JPGフォールバック付き）
- [ ] SVGアイコンを最適化
- [ ] プレースホルダー画像を作成
- [ ] 画像の合計サイズを確認（500KB以下）
