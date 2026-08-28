import {
  ArrowLeft,
  BatteryCharging,
  CloudSun,
  Github,
  Languages,
  LayoutGrid,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const BASE = import.meta.env.BASE_URL;

const FEATURES = [
  {
    icon: BatteryCharging,
    title: '充電中のスマートディスプレイ',
    description:
      '充電中のスマートフォンを、時計・天気・エフェクトを表示するおしゃれなスクリーンセーバーに変えます。',
  },
  {
    icon: Sparkles,
    title: '39種のビジュアルエフェクト',
    description:
      '桜吹雪・雨・雪などの自然エフェクトから、ボロノイ・万華鏡・フラクタルなどのアートエフェクト、音楽ビジュアライザーまで搭載。',
  },
  {
    icon: CloudSun,
    title: 'リアルタイム天気表示',
    description: '現在地の気温と天気アイコンをリアルタイムで表示します。',
  },
  {
    icon: LayoutGrid,
    title: 'レイアウトエディタ',
    description:
      '時計・天気ウィジェットの位置やサイズをドラッグ＆ドロップで自由にカスタマイズできます。',
  },
  {
    icon: Users,
    title: 'コミュニティ壁紙',
    description:
      '壁紙の閲覧・お気に入り登録・投稿ができるコミュニティ機能を搭載しています。',
  },
  {
    icon: Languages,
    title: '4言語対応',
    description:
      '日本語 / English / 中文 / 한국어 に対応。初回起動時や設定画面から切り替えられます。',
  },
] as const;

const TECH_STACK = [
  'Kotlin',
  'Jetpack Compose',
  'Material Design 3',
  'Clean Architecture',
  'Hilt',
  'Room',
  'Firebase',
  'WorkManager',
] as const;

export function MagDisplayPage() {
  usePageTitle('MagDisplay');

  return (
    <div
      className="min-h-screen text-slate-800"
      style={{ backgroundColor: '#fbb07b' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[#fbb07b]/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            to="/projects"
            className="rounded-lg p-2 text-[#199026] transition-colors hover:bg-black/10"
            aria-label="プロジェクト一覧に戻る"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img
              src={`${BASE}magdisplay/icon_512.png`}
              alt="MagDisplay アプリアイコン"
              className="size-8 rounded-lg shadow-sm"
            />
            <h1 className="font-bold text-[#199026]">MagDisplay</h1>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="text-center md:text-left">
              <img
                src={`${BASE}magdisplay/icon_512.png`}
                alt="MagDisplay アプリアイコン"
                className="mx-auto mb-6 size-24 rounded-2xl shadow-lg md:mx-0"
              />
              <h2 className="mb-4 text-3xl font-bold text-[#199026] md:text-4xl">
                充電中を、
                <br />
                スマートディスプレイに。
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-slate-700">
                MagDisplay
                は、充電中のスマートフォンをおしゃれなスマートディスプレイに変える
                Android
                スクリーンセーバーアプリです。時計・天気・壁紙をカスタマイズして、あなただけのディスプレイを作りましょう。
              </p>
              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                <a
                  href="https://github.com/ryoupr/MagDisplay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#199026] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#147a20]"
                >
                  <Github className="size-5" />
                  GitHub で見る
                </a>
                <Link
                  to="/magdisplay/privacy"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#199026] bg-white/70 px-6 py-3 font-medium text-[#199026] transition-colors hover:bg-white"
                >
                  <Shield className="size-5" />
                  プライバシーポリシー
                </Link>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <img
                src={`${BASE}magdisplay/01_dream_mode.png`}
                alt="MagDisplay のスクリーンセーバー表示画面"
                className="w-40 rounded-2xl border-4 border-white shadow-2xl md:w-48"
                loading="lazy"
              />
              <img
                src={`${BASE}magdisplay/02_browser.png`}
                alt="MagDisplay のコミュニティ壁紙ブラウザ画面"
                className="mt-8 w-40 rounded-2xl border-4 border-white shadow-2xl md:w-48"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <h3 className="mb-12 text-center text-2xl font-bold text-[#199026] md:text-3xl">
            主な機能
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-[#199026]/10 p-3">
                    <Icon className="size-6 text-[#199026]" />
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-slate-800">
                    {feature.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl text-center">
          <h3 className="mb-8 text-2xl font-bold text-[#199026] md:text-3xl">
            技術スタック
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-[#199026]/30 bg-white/70 px-4 py-2 text-sm font-medium text-[#199026]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-3xl bg-[#199026] px-6 py-12 text-center shadow-lg">
            <h3 className="mb-3 text-2xl font-bold text-white">
              MagDisplay をチェック
            </h3>
            <p className="mb-8 text-white/90">
              ソースコードや開発状況は GitHub で公開しています。
            </p>
            <a
              href="https://github.com/ryoupr/MagDisplay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-[#199026] shadow-md transition-transform hover:scale-105"
            >
              <Github className="size-5" />
              GitHub リポジトリ
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-[#199026] px-4 py-8">
        <div className="container mx-auto max-w-5xl text-center text-white/90">
          <nav className="mb-4 flex justify-center gap-6 text-sm">
            <Link to="/projects" className="hover:underline">
              プロジェクト一覧
            </Link>
            <Link to="/magdisplay/privacy" className="hover:underline">
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
