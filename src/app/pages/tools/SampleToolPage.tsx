import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';

export function SampleToolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to="/tools"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              ← ツール一覧に戻る
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            サンプルツール
          </h1>

          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300">
                ここにツールの実装を追加してください
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
