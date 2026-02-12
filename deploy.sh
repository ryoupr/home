#!/bin/bash
# ⚠️ 非推奨: GitHub Actions (.github/workflows/deploy.yml) で自動デプロイされます。
# main ブランチへの push で自動的にビルド・デプロイが実行されます。
# このスクリプトは緊急時の手動デプロイ用として残しています。

set -euo pipefail

echo "⚠️  GitHub Actions による自動デプロイが推奨です。手動デプロイを続行しますか？ (y/N)"
read -r confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "中止しました。git push origin main で自動デプロイされます。"
  exit 0
fi

echo "Building project..."
npm run build

echo "Committing changes..."
git add dist/
git commit -m "Manual deploy: $(date +%Y-%m-%d_%H:%M)"

echo "Pushing to GitHub..."
git push origin main

echo "✅ Push complete. GitHub Actions がデプロイを実行します。"
