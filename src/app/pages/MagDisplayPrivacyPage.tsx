import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const BASE = import.meta.env.BASE_URL;

const LAST_UPDATED = '2026年8月29日';

// 端末外に送信するデータと送信先（実装に基づく）
const DATA_SENT = [
  {
    data: 'Google アカウント情報（メールアドレス・表示名）',
    destination: 'Firebase Authentication（Google LLC）',
    purpose: 'ユーザー認証（Google ログイン利用時）',
  },
  {
    data: '匿名 UID',
    destination: 'Firebase Authentication（Google LLC）',
    purpose: 'ユーザー識別',
  },
  {
    data: '設定・壁紙などのバックアップデータ（端末識別子 ANDROID_ID・端末の機種名を含む）',
    destination:
      'AWS S3（Amazon Web Services, Inc.）／ Google Drive（Google LLC）',
    purpose: 'クラウドバックアップ・同期',
  },
  {
    data: '位置情報（緯度・経度）',
    destination: 'Open-Meteo（open-meteo.com）',
    purpose: '現在地の天気取得（天気表示を有効にした場合のみ）',
  },
  {
    data: 'クラッシュ情報・端末情報',
    destination: 'Firebase Crashlytics（Google LLC）',
    purpose: '不具合の検知と品質改善',
  },
  {
    data: 'プッシュ通知トークン',
    destination: 'Firebase Cloud Messaging（Google LLC）',
    purpose: 'お知らせ等の通知配信',
  },
] as const;

// 端末内でのみ利用し、外部に送信しないデータ
const DATA_LOCAL = [
  {
    data: 'カレンダーの予定情報',
    purpose: 'カレンダーヒートマップ等のエフェクト表示（端末内でのみ利用）',
  },
  {
    data: '歩数（身体活動データ）',
    purpose: '歩数リング等のエフェクト表示（端末内でのみ利用）',
  },
  {
    data: '再生中の音楽・通知情報',
    purpose: '音楽ビジュアライザー等の表示（端末内でのみ利用）',
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
            to="/projects/magdisplay"
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
          <p className="mb-2 text-sm text-slate-500">
            最終更新日: {LAST_UPDATED}
          </p>
          <p className="mb-8 leading-relaxed text-slate-700">
            本プライバシーポリシーは、Android
            アプリ「MagDisplay」（以下「本アプリ」）
            における個人情報および利用者データの取り扱いについて定めるものです。
            本アプリを利用することで、本ポリシーに同意したものとみなします。
          </p>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              1. 端末外に送信するデータと送信先
            </h2>
            <p className="mb-4 text-slate-700">
              本アプリは、以下のデータを機能の提供に必要な範囲で外部サービスに送信します。
              各データは、対応する機能を利用した場合にのみ送信されます。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#199026]/10 text-[#199026]">
                    <th className="border border-slate-200 px-3 py-2">
                      データ
                    </th>
                    <th className="border border-slate-200 px-3 py-2">
                      送信先
                    </th>
                    <th className="border border-slate-200 px-3 py-2">目的</th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_SENT.map((row) => (
                    <tr key={row.data}>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        {row.data}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        {row.destination}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-700">
                        {row.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              位置情報は、天気表示のために天気情報サービス（Open-Meteo）へ緯度・経度を
              送信して現在地の天気を取得する目的のみに使用し、本アプリの運営者が位置情報を
              保存・蓄積することはありません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              2. 端末内でのみ利用するデータ
            </h2>
            <p className="mb-4 text-slate-700">
              以下のデータは、表示機能のために端末内でのみ読み取り・利用され、
              外部サーバーへ送信・保存されることはありません。
            </p>
            <ul className="space-y-2 text-slate-700">
              {DATA_LOCAL.map((row) => (
                <li key={row.data} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-[#199026]" />
                  <span>
                    <strong>{row.data}</strong>
                    <span className="text-slate-500">（{row.purpose}）</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              3. 利用する権限
            </h2>
            <p className="mb-4 text-slate-700">
              本アプリは、機能提供のために以下の権限を必要に応じて使用します。
              権限の許可は任意であり、許可しない場合は該当機能が利用できないことがあります。
            </p>
            <ul className="list-disc space-y-2 pl-6 text-slate-700">
              <li>
                <strong>位置情報</strong>:
                現在地の天気を取得するために使用します。
              </li>
              <li>
                <strong>カレンダー</strong>:
                カレンダー系エフェクトの表示に使用します。
              </li>
              <li>
                <strong>身体活動（歩数）</strong>:
                歩数系エフェクトの表示に使用します。
              </li>
              <li>
                <strong>通知</strong>:
                お知らせの表示、および通知系エフェクトに使用します。
              </li>
              <li>
                <strong>ストレージ</strong>: 壁紙画像の読み込みに使用します。
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              4. データの保持と削除
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-700">
              <li>
                クラウドに保存された設定・壁紙データは、アカウントを削除すると
                削除されます。
              </li>
              <li>
                アプリをアンインストールすると、端末内に保存されたデータは削除されます。
              </li>
              <li>
                データの削除を希望する場合は、下記のお問い合わせ先までご連絡ください。
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              5. 第三者への提供
            </h2>
            <p className="text-slate-700">
              本アプリは、上記「1.
              端末外に送信するデータと送信先」に記載したサービスを
              除き、利用者のデータを第三者に提供・販売することはありません。各サービスに
              おけるデータの取り扱いは、それぞれの提供者のプライバシーポリシーに従います。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              6. データの安全管理
            </h2>
            <p className="text-slate-700">
              外部サービスとの通信は暗号化された接続（HTTPS）を通じて行われます。
              端末内の設定データは暗号化して保存されます。
            </p>
            <p className="mt-3 text-sm text-slate-600">
              バックアップに含まれる端末識別子（ANDROID_ID）および機種名は、
              どの端末で作成されたバックアップかを利用者が判別できるようにする目的でのみ
              使用し、広告や個人の追跡には利用しません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              7. 子どものプライバシー
            </h2>
            <p className="text-slate-700">
              本アプリは、13
              歳未満の子どもを対象としたものではなく、意図的に子どもの個人情報を
              収集することはありません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              8. 本ポリシーの変更
            </h2>
            <p className="text-slate-700">
              本ポリシーは、機能追加や法令の変更に応じて改定される場合があります。
              重要な変更がある場合は、本ページの更新をもって通知とします。改定後の
              内容は、本ページに掲載した時点で効力を生じます。
            </p>
          </section>

          <section>
            <h2 className="mb-3 border-l-4 border-[#199026] pl-3 text-xl font-bold text-[#199026]">
              9. お問い合わせ
            </h2>
            <p className="text-slate-700">
              本ポリシーに関するご質問やデータの削除依頼は、下記のメールアドレス
              よりお問い合わせください。
            </p>
            <a
              href="mailto:tr120710@gmail.com"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#199026] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#147a20]"
            >
              <Mail className="size-4" />
              メールで問い合わせる
            </a>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-[#199026] px-4 py-8">
        <div className="container mx-auto max-w-5xl text-center text-white/90">
          <nav className="mb-4 flex justify-center gap-6 text-sm">
            <Link to="/projects/magdisplay" className="hover:underline">
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
