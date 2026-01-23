# ポートフォリオサイト コンテンツ管理

このファイルでは、サイトのコンテンツを管理する方法を説明します。

## 個人情報の編集

`src/data/config.json` の `personal` セクションを編集：

```json
{
  "personal": {
    "name": "あなたの名前",
    "role": "あなたの役職",
    "description": "自己紹介文",
    "email": "your.email@example.com",
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername",
    "qiita": "https://qiita.com/yourusername",
    "skills": ["React", "TypeScript", "AWS"]
  }
}
```

## プロジェクトの編集

`src/data/config.json` の `projects` 配列を編集：

```json
{
  "projects": [
    {
      "id": 1,
      "title": "プロジェクト名",
      "description": "プロジェクトの説明",
      "tags": ["React", "TypeScript"],
      "demoUrl": "https://demo.com",
      "githubUrl": "https://github.com/user/project",
      "category": "webapp"
    }
  ]
}
```

**category の種類:**
- `"webapp"` - Webアプリケーション
- `"program"` - プログラム・ツール
- `"extension"` - Chrome拡張機能

## 更新手順

1. `src/data/config.json` を編集
2. ローカルで確認:
   ```bash
   npm run dev
   ```
3. ビルドとデプロイ:
   ```bash
   npm run build
   ./deploy.sh
   ```

## 画像の追加

- `images/hero/` - アバター画像
- `images/projects/` - プロジェクトスクリーンショット
- `images/icons/` - アイコン（SVG推奨）

詳細は [IMAGE_OPTIMIZATION_GUIDE.md](../images/IMAGE_OPTIMIZATION_GUIDE.md) を参照。
