import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const BASE = import.meta.env.BASE_URL;

const LAST_UPDATED = '2026年3月17日';

const THIRD_PARTIES = [
  {
    service: 'Firebase Authentication',
    provider: 'Google LLC',
    purpose: 'ユーザー認証',
  },
  {
    service: 'AWS S3',
    provider: 'Amazon Web Services, Inc.',
    purpose: 'クラウドストレージ',
  },
] as const;

export function MagDisplayPrivacyPage() {
  usePageTitle('MagDisplay プライバシーポリシー');

  return (
    <div
      className="min-h-screen text-slate-800"
      style={{ backgroundColor: '#fbb07b' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[#fbb07b]/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            to="/magdisplay"
            className="rounded-lg p-2 text-[#199026] transition-colors hover:bg-black/10"
            aria-label="MagDisplay 紹介ページに戻る"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img
              src={`${BASE}magdisplay/icon_512.png`}
              alt="MagDisplay アプリアイコン"
              className="size-8 rounded-lg shadow-sm"
            />
            <h1 className="font-bold text-[#199026]">
              MagDisplay プライバシーポリシー
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-12">
        <article className="container mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-md md:p-10">
          <p className="mb-8 text-sm text-slate-500">
            最終更新日: {LAST_UPDATED}
          </p>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              収集するデータ
            </h2>
            <p className="mb-3 text-slate-700">
              MagDisplay は以下の情報を収集します。
            </p>
            <ul className="list-disc space-y-2 pl-6 text-slate-700">
              <li>
                <strong>Google アカウント情報</strong>:
                メールアドレス・表示名（Google Sign-In を使用した場合）
              </li>
              <li>
                <strong>匿名 UID</strong>: Firebase
                匿名認証により自動生成される識別子
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              利用目的
            </h2>
            <p className="mb-3 text-slate-700">
              収集した情報は以下の目的にのみ使用します。
            </p>
            <ul className="list-disc space-y-2 pl-6 text-slate-700">
              <li>ユーザー識別</li>
              <li>クラウド同期（設定・壁紙データのバックアップ）</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              第三者提供
            </h2>
            <p className="mb-4 text-slate-700">
              収集したデータは以下のサービスに送信されます。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#199026]/10 text-[#199026]">
                    <th className="border border-slate-200 px-4 py-2">
                      サービス
                    </th>
                    <th className="border border-slate-200 px-4 py-2">
                      提供者
                    </th>
                    <th className="border border-slate-200 px-4 py-2">目的</th>
                  </tr>
                </thead>
                <tbody>
                  {THIRD_PARTIES.map((row) => (
                    <tr key={row.service}>
                      <td className="border border-slate-200 px-4 py-2 text-slate-700">
                        {row.service}
                      </td>
                      <td className="border border-slate-200 px-4 py-2 text-slate-700">
                        {row.provider}
                      </td>
                      <td className="border border-slate-200 px-4 py-2 text-slate-700">
                        {row.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-slate-700">
              これら以外の第三者にデータを販売・提供することはありません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              データ保持・削除
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-700">
              <li>アカウントを削除するとデータは削除されます。</li>
              <li>
                削除を希望する場合は下記お問い合わせ先までご連絡ください。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              お問い合わせ
            </h2>
            <p className="text-slate-700">
              ご質問・削除依頼は GitHub Issues よりお問い合わせください。
            </p>
            <a
              href="https://github.com/ryoupr/MagDisplay/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#199026] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#147a20]"
            >
              <ExternalLink className="size-4" />
              GitHub Issues を開く
            </a>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-[#199026] px-4 py-8">
        <div className="container mx-auto max-w-5xl text-center text-white/90">
          <nav className="mb-4 flex justify-center gap-6 text-sm">
            <Link to="/magdisplay" className="hover:underline">
              MagDisplay について
            </Link>
            <Link to="/projects" className="hover:underline">
              プロジェクト一覧
            </Link>
          </nav>
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Ryoichiro Teshima. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
