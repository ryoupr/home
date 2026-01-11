---
inclusion: always
---

# プロダクト概要

個人ポートフォリオサイト - Web開発者向けのモダンなポートフォリオWebサイト

## 目的

開発者が自身のプロジェクト、スキル、経歴を紹介するためのレスポンシブなポートフォリオサイト。

## 主な機能

- プロフィール表示（名前、役職、自己紹介、SNSリンク）
- プロジェクト一覧表示（カテゴリ別フィルタリング対応）
- レスポンシブデザイン（モバイルファースト）
- アクセシビリティ対応（WCAG 2.1 AA準拠）
- GitHub Pagesデプロイ対応

## プロジェクトカテゴリ

- `webapp` - Webアプリケーション
- `program` - CLIツール、スクリプト
- `extension` - Chrome拡張機能

## コンテンツ管理

サイトコンテンツは `src/data/config.json` で一元管理する。

### config.json構造

```json
{
  "personal": {
    "name": "string",
    "role": "string",
    "description": "string",
    "email": "string",
    "github": "URL",
    "linkedin": "URL",
    "qiita": "URL",
    "skills": ["string"]
  },
  "projects": [
    {
      "id": "number (一意)",
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "demoUrl": "URL (任意)",
      "githubUrl": "URL (任意)",
      "category": "webapp | program | extension"
    }
  ]
}
```

## 実装時の注意事項

- コンテンツ変更は `config.json` のみを編集する
- 新規プロジェクト追加時は `id` を一意に設定する
- `category` は定義済みの値のみ使用する
- 画像は `images/projects/` に配置し、最適化ガイドに従う
