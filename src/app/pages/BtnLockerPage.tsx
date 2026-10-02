import {
  ArrowLeft,
  Github,
  Globe,
  Languages,
  MousePointerClick,
  Shield,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const BASE = import.meta.env.BASE_URL;

const GITHUB_URL = 'https://github.com/ryoupr/btn-hunter';

const FEATURES = [
  {
    icon: Shield,
    title: 'ボタンをロックして誤爆を防止',
    description:
      '押し間違えたくないボタンをロックすると、通常のシングルクリックでは発火しなくなります。誤送信・誤削除・誤購入などの事故を防ぎます。',
  },
  {
    icon: ShieldCheck,
    title: 'ダブルクリック＋確認モーダル',
    description:
      'ロック中のボタンをダブルクリックすると確認モーダルが表示され、「今回だけ実行する」を選んだときだけ本来の処理が実行されます。',
  },
  {
    icon: Globe,
    title: 'サイト単位で永続化',
    description:
      'ロック情報はサイト（オリジン）単位でブラウザ内（chrome.storage.local）に保存され、リロード後も維持されます。',
  },
  {
    icon: Workflow,
    title: 'SPA 対応',
    description:
      '後から生成されたボタンにもロックを自動で再適用します。読み込み直後の素通しウィンドウも最小限に抑えています。',
  },
  {
    icon: Languages,
    title: '9言語対応',
    description:
      '英語 / 中国語（簡体字）/ スペイン語 / ヒンディー語 / アラビア語 / ポルトガル語（ブラジル）/ ロシア語 / ベンガル語 / 日本語に対応。ブラウザの表示言語に自動で追従します。',
  },
] as const;

const STEPS = [
  'ツールバーのボタン（またはショートカットキー）でロックモードを開始します。',
  '南京錠のカーソルで、ブロックしたいボタンをクリックしてロックします。',
  'ロック中のボタンはシングルクリックしても何も起きません。',
  '本当に押したいときはダブルクリックし、確認モーダルで「今回だけ実行する」を選びます。',
  'ロックを外すときは、モーダルの「ロック解除」またはポップアップの一覧から解除します。',
] as const;

const SCREENSHOTS = [
  { file: 'screenshot-1-aim.png', alt: 'ロックモードでボタンを狙っている様子' },
  { file: 'screenshot-2-locked.png', alt: 'ボタンがロックされた状態' },
  {
    file: 'screenshot-3-confirm.png',
    alt: 'ダブルクリックで表示される確認モーダル',
  },
] as const;

export function BtnLockerPage() {
  usePageTitle('btn-locker — ボタンロッカー');

  return (
    <div className="min-h-screen bg-[#fff6e8] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[#fff6e8]/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            to="/projects"
            className="rounded-lg p-2 text-[#c96a00] transition-colors hover:bg-black/5"
            aria-label="プロジェクト一覧に戻る"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img
              src={`${BASE}btn-locker/icon_128.png`}
              alt="btn-locker アイコン"
              className="size-8 rounded-lg shadow-sm"
            />
            <span className="font-bold text-[#c96a00]">btn-locker</span>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="px-4 py-16 text-center">
          <div className="container mx-auto max-w-3xl">
            <img
              src={`${BASE}btn-locker/icon_128.png`}
              alt="btn-locker アイコン"
              className="mx-auto mb-6 size-28 rounded-3xl shadow-lg"
            />
            <h1 className="mb-2 text-4xl font-bold text-[#c96a00] md:text-5xl">
              btn-locker
            </h1>
            <p className="mb-6 text-lg font-medium text-[#ff9500]">
              ボタンロッカー
            </p>
            <p className="mb-8 leading-relaxed text-slate-700">
              「うっかり押し」や「事故タップ」を防ぐ、ボタン誤爆防止の Chrome
              拡張機能。ページ上の危険なボタンをロックすると、通常の 1
              クリックでは発火しなくなります。本当に押したいときは、ダブルクリック
              → 確認モーダルで承認してから実行します。
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/projects/btn-locker/privacy"
                className="inline-flex items-center gap-2 rounded-lg bg-[#c96a00] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#a85a00]"
              >
                <ShieldCheck className="size-4" />
                プライバシーポリシー
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#c96a00] px-5 py-2.5 font-medium text-[#c96a00] transition-colors hover:bg-[#ff9500]/10"
              >
                <Github className="size-4" />
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-12">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-[#c96a00]">
              主な機能
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl bg-white p-6 shadow-md"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-[#ff9500]/15 p-3 text-[#c96a00]">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="mb-2 font-bold text-slate-800">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="px-4 py-12">
          <div className="container mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-[#c96a00]">
              使い方
            </h2>
            <ol className="space-y-4">
              {STEPS.map((step, i) => (
                <li
                  key={step}
                  className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm"
                >
                  <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff9500] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex items-start gap-2 text-sm text-slate-600">
              <MousePointerClick className="mt-0.5 size-4 flex-shrink-0 text-[#c96a00]" />
              ショートカットキーの既定は未設定です。chrome://extensions/shortcuts
              で「ロックモードの ON/OFF
              切り替え」に好きなキーを割り当ててください。
            </p>
          </div>
        </section>

        {/* Screenshots */}
        <section className="px-4 py-12">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-[#c96a00]">
              スクリーンショット
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {SCREENSHOTS.map((s) => (
                <img
                  key={s.file}
                  src={`${BASE}btn-locker/${s.file}`}
                  alt={s.alt}
                  loading="lazy"
                  className="w-full rounded-xl border border-[#ff9500]/30 shadow-md"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Privacy summary */}
        <section className="px-4 py-12">
          <div className="container mx-auto max-w-3xl rounded-2xl bg-white p-6 text-center shadow-md md:p-10">
            <h2 className="mb-3 text-2xl font-bold text-[#c96a00]">
              プライバシー
            </h2>
            <p className="mb-6 leading-relaxed text-slate-700">
              ロック情報は端末内のブラウザストレージにのみ保存され、外部サーバーへの送信は一切行いません。
            </p>
            <Link
              to="/projects/btn-locker/privacy"
              className="inline-flex items-center gap-2 rounded-lg bg-[#c96a00] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#a85a00]"
            >
              プライバシーポリシーを読む
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-[#c96a00] px-4 py-8">
        <div className="container mx-auto max-w-5xl text-center text-white/90">
          <nav className="mb-4 flex justify-center gap-6 text-sm">
            <Link to="/projects" className="hover:underline">
              プロジェクト一覧
            </Link>
            <Link to="/projects/btn-locker/privacy" className="hover:underline">
              プライバシーポリシー
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
