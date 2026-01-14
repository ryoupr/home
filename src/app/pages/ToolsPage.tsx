import { Link } from 'react-router-dom';

export function ToolsPage() {
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
            {/* ツールカードのプレースホルダー */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                サンプルツール
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                ツールの説明がここに入ります
              </p>
              <Link
                to="/tools/sample"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                ツールを開く
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
