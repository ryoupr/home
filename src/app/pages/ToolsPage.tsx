import { BarChart2, Box, Calendar, FileText, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export function ToolsPage() {
  usePageTitle('Tools');
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              to="/"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              ← ホームに戻る
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            WEBツール
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            便利なWEBツールを公開しています
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* CSVグラフビューアー */}
            <Link to="/tools/csv-graph-viewer">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <BarChart2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    CSV Graph Viewer
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  CSVファイルをアップロードして、インタラクティブなグラフを作成。棒グラフ、折れ線グラフ、面グラフに対応し、目標ラインやエリアの追加、カラーテーマのカスタマイズが可能です。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                    データ可視化
                  </span>
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                    CSV
                  </span>
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                    グラフ作成
                  </span>
                </div>
              </div>
            </Link>

            {/* Icon Generator */}
            <Link to="/tools/icon-generator">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Icon Generator
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  アイコンやテキストを使ってカスタムアイコンを作成。背景色、グラデーション、サイズ、角丸、回転などを調整して、1024x1024のPNG画像としてダウンロードできます。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    アイコン作成
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    PNG出力
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    カスタマイズ
                  </span>
                </div>
              </div>
            </Link>

            {/* 矢羽スケジュール */}
            <Link to="/tools/yabane-schedule">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    矢羽スケジュール
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  矢羽（シェブロン）形状のガントチャートを作成。日本の祝日対応、日次〜年度表示の切替、PowerPoint出力に対応したプロジェクト管理ツールです。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    ガントチャート
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    PPTX出力
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    祝日対応
                  </span>
                </div>
              </div>
            </Link>

            {/* Slide Builder */}
            <Link to="/tools/slide-builder">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg">
                    <Presentation className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Slide Builder
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  AIが生成したHTMLスライドコードを貼り付けるだけで、各要素が個別に編集可能なPowerPointファイルを生成。デザインの微調整が自由自在です。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-full">
                    HTML→PPTX
                  </span>
                  <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-full">
                    AI連携
                  </span>
                  <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-full">
                    個別編集可能
                  </span>
                </div>
              </div>
            </Link>

            {/* BoxNote Converter */}
            <Link to="/tools/boxnote-converter">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    BoxNote → Markdown
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Box
                  Notesの.boxnoteファイルをMarkdownに変換。見出し、リスト、テーブル、リンク等の書式を保持したまま変換できます。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                    BoxNote
                  </span>
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                    Markdown
                  </span>
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                    フォーマット変換
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
