# 📝 サイトの編集方法

このファイルでは、技術的な知識がなくてもサイトを簡単に編集する方法を説明します。

## 🎯 編集するファイル

**`src/data/config.json`** - このファイルだけを編集すればOKです！

---

## 📋 編集手順

### 1. 個人情報を更新

`config.json` の `personal` セクションを編集：

```json
"personal": {
  "name": "あなたの名前",
  "role": "あなたの役職",
  "description": "自己紹介文をここに書きます",
  "email": "your.email@example.com",
  "github": "https://github.com/yourusername",
  "linkedin": "https://linkedin.com/in/yourusername"
}
```

### 2. プロジェクトを追加・編集

`projects` 配列にプロジェクトを追加：

```json
{
  "id": 7,
  "title": "新しいプロジェクト",
  "description": "プロジェクトの説明文",
  "tags": ["React", "TypeScript"],
  "demoUrl": "https://demo.com",
  "githubUrl": "https://github.com/user/project",
  "category": "webapp"
}
```

**category の種類:**

- `"webapp"` - Webアプリケーション
- `"program"` - プログラム・ツール
- `"extension"` - Chrome拡張機能

### 3. プロジェクトを削除

削除したいプロジェクトの `{ ... }` ブロック全体を削除します。

---

## 🚀 変更を反映する

### 方法1: 自動デプロイスクリプト（推奨）

```bash
./deploy.sh
```

### 方法2: 手動デプロイ

```bash
# 1. ビルド
npm run build

# 2. ファイルをコピー
cp -r dist/* .

# 3. GitHubにプッシュ
git add .
git commit -m "Update content"
git push origin main
```

---

## ✅ 編集のヒント

### JSON の書き方

- 文字列は `"` で囲む
- 配列の要素は `,` で区切る（最後の要素の後ろには `,` 不要）
- 日本語も使えます

### よくあるエラー

❌ **間違い:**

```json
{
  "name": "太郎",  ← 最後にカンマがある
}
```

✅ **正しい:**

```json
{
  "name": "太郎"
}
```

---

## 🆘 困ったときは

1. JSON の構文チェック: <https://jsonlint.com/>
2. ファイルを元に戻す: `git checkout src/data/config.json`

---

## 📝 編集例

### プロジェクトを追加する場合

```json
"projects": [
  {
    "id": 1,
    "title": "既存のプロジェクト",
    ...
  },
  {
    "id": 2,
    "title": "新しいプロジェクト",
    "description": "これは新しく追加したプロジェクトです",
    "tags": ["JavaScript", "HTML", "CSS"],
    "githubUrl": "https://github.com/user/new-project",
    "category": "webapp"
  }
]
```

### 個人情報を変更する場合

```json
"personal": {
  "name": "山田太郎",
  "role": "フルスタック開発者",
  "description": "Web開発が大好きです。React と TypeScript を使った開発を得意としています。",
  "email": "taro@example.com",
  "github": "https://github.com/taro",
  "linkedin": "https://linkedin.com/in/taro"
}
```
