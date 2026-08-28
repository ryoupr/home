import {
  ArrowLeft,
  BatteryCharging,
  CloudSun,
  Languages,
  LayoutGrid,
  Shield,
  Sparkles,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
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

// 「ポチャッ」とした弾む動き用のスプリング
const squishySpring = {
  type: 'spring',
  stiffness: 260,
  damping: 12,
  mass: 0.9,
} as const;

const softSpring = {
  type: 'spring',
  stiffness: 180,
  damping: 18,
} as const;

export function MagDisplayPage() {
  usePageTitle('MagDisplay');
  const reduce = useReducedMotion();

  return (
    <div
      className="relative min-h-screen overflow-hidden text-slate-800"
      style={{ backgroundColor: '#fbb07b' }}
    >
      {/* 暖色の柔らかい浮遊グロー背景 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute -left-24 top-10 size-72 rounded-full bg-[#ffd08a]/50 blur-3xl"
          animate={
            reduce
              ? undefined
              : { y: [0, 30, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }
          }
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-[-6rem] top-1/3 size-80 rounded-full bg-[#ff9d6b]/40 blur-3xl"
          animate={
            reduce
              ? undefined
              : { y: [0, -40, 0], x: [0, -20, 0], scale: [1, 1.15, 1] }
          }
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-10 left-1/4 size-64 rounded-full bg-[#199026]/20 blur-3xl"
          animate={reduce ? undefined : { y: [0, -25, 0], scale: [1, 1.08, 1] }}
          transition={{
            duration: 14,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      </div>

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
            <motion.img
              src={`${BASE}magdisplay/icon_512.png`}
              alt="MagDisplay アプリアイコン"
              className="size-8 rounded-lg shadow-sm"
              whileHover={reduce ? undefined : { scale: 1.15, rotate: -6 }}
              transition={squishySpring}
            />
            <h1 className="font-bold text-[#199026]">MagDisplay</h1>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <motion.div
              className="text-center md:text-left"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12 } },
              }}
            >
              <motion.img
                src={`${BASE}magdisplay/icon_512.png`}
                alt="MagDisplay アプリアイコン"
                className="mx-auto mb-6 size-24 rounded-2xl shadow-lg md:mx-0"
                variants={{
                  hidden: { opacity: 0, scale: 0.4, y: -20 },
                  show: { opacity: 1, scale: 1, y: 0 },
                }}
                transition={reduce ? { duration: 0.2 } : squishySpring}
                whileHover={
                  reduce ? undefined : { scale: 1.08, rotate: [0, -6, 6, 0] }
                }
              />
              <motion.h2
                className="mb-4 text-3xl font-bold text-[#199026] md:text-4xl"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={softSpring}
              >
                充電中を、
                <br />
                スマートディスプレイに。
              </motion.h2>
              <motion.p
                className="mb-8 text-lg leading-relaxed text-slate-700"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={softSpring}
              >
                MagDisplay
                は、充電中のスマートフォンをおしゃれなスマートディスプレイに変える
                Android
                スクリーンセーバーアプリです。時計・天気・壁紙をカスタマイズして、あなただけのディスプレイを作りましょう。
              </motion.p>
              <motion.div
                className="flex flex-wrap justify-center gap-3 md:justify-start"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={softSpring}
              >
                <motion.div
                  whileHover={reduce ? undefined : { scale: 1.05 }}
                  whileTap={reduce ? undefined : { scale: 0.95 }}
                  transition={squishySpring}
                >
                  <Link
                    to="/projects/magdisplay/privacy"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#199026] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#147a20]"
                  >
                    <Shield className="size-5" />
                    プライバシーポリシー
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
            <div className="flex justify-center gap-4">
              <motion.img
                src={`${BASE}magdisplay/01_dream_mode.png`}
                alt="MagDisplay のスクリーンセーバー表示画面"
                className="w-40 rounded-2xl border-4 border-white shadow-2xl md:w-48"
                loading="lazy"
                initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={
                  reduce ? { duration: 0.3 } : { ...squishySpring, delay: 0.3 }
                }
                whileHover={reduce ? undefined : { scale: 1.04, rotate: 1 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 bg-white px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <h3 className="mb-12 text-center text-2xl font-bold text-[#199026] md:text-3xl">
            主な機能
          </h3>
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm"
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                    show: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={reduce ? { duration: 0.25 } : squishySpring}
                  whileHover={
                    reduce
                      ? undefined
                      : {
                          y: -6,
                          scale: 1.03,
                          boxShadow: '0 12px 30px rgba(25,144,38,0.18)',
                        }
                  }
                >
                  <motion.div
                    className="mb-4 inline-flex rounded-xl bg-[#199026]/10 p-3"
                    whileHover={
                      reduce ? undefined : { scale: 1.15, rotate: -8 }
                    }
                    transition={squishySpring}
                  >
                    <Icon className="size-6 text-[#199026]" />
                  </motion.div>
                  <h4 className="mb-2 text-lg font-bold text-slate-800">
                    {feature.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl text-center">
          <h3 className="mb-8 text-2xl font-bold text-[#199026] md:text-3xl">
            技術スタック
          </h3>
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {TECH_STACK.map((tech) => (
              <motion.span
                key={tech}
                className="rounded-full border border-[#199026]/30 bg-white/70 px-4 py-2 text-sm font-medium text-[#199026]"
                variants={{
                  hidden: { opacity: 0, scale: 0.6 },
                  show: { opacity: 1, scale: 1 },
                }}
                transition={reduce ? { duration: 0.2 } : squishySpring}
                whileHover={
                  reduce
                    ? undefined
                    : { scale: 1.1, backgroundColor: '#ffffff' }
                }
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 pb-20">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="rounded-3xl bg-[#199026] px-6 py-12 text-center shadow-lg"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reduce ? { duration: 0.3 } : softSpring}
          >
            <h3 className="mb-3 text-2xl font-bold text-white">
              MagDisplay をチェック
            </h3>
            <p className="mb-8 text-white/90">
              アプリの詳細やプライバシーポリシーはこちらからご確認いただけます。
            </p>
            <motion.div
              className="inline-block"
              whileHover={reduce ? undefined : { scale: 1.06 }}
              whileTap={reduce ? undefined : { scale: 0.94 }}
              transition={squishySpring}
            >
              <Link
                to="/projects/magdisplay/privacy"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-[#199026] shadow-md"
              >
                <Shield className="size-5" />
                プライバシーポリシー
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/10 bg-[#199026] px-4 py-8">
        <div className="container mx-auto max-w-5xl text-center text-white/90">
          <nav className="mb-4 flex justify-center gap-6 text-sm">
            <Link to="/projects" className="hover:underline">
              プロジェクト一覧
            </Link>
            <Link to="/projects/magdisplay/privacy" className="hover:underline">
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
