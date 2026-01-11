#!/bin/bash
# キャッシュをクリアして開発サーバーを起動するスクリプト

echo "🧹 Viteキャッシュをクリア中..."
rm -rf node_modules/.vite

echo "🗑️  distフォルダをクリア中..."
rm -rf dist

echo "🚀 開発サーバーを起動中..."
npm run dev
