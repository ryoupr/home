import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { ProjectsSection } from '../components/ProjectsSection';
import { usePageTitle } from '../hooks/usePageTitle';

export function ProjectsPage() {
  usePageTitle('Projects');
  return (
    <div className="size-full bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 shadow-lg shadow-cyan-500/5">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-cyan-400"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
            Projects
          </h1>
        </div>
      </header>

      {/* Featured: MagDisplay 専用ページへの導線 */}
      <div className="bg-slate-950 px-4 pt-12">
        <div className="container mx-auto max-w-6xl">
          <Link
            to="/magdisplay"
            className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm transition-all hover:border-[#199026] hover:shadow-[0_0_30px_rgba(25,144,38,0.25)]"
          >
            <img
              src={`${import.meta.env.BASE_URL}magdisplay/icon_512.png`}
              alt="MagDisplay アプリアイコン"
              className="size-14 flex-shrink-0 rounded-xl shadow-md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-[#199026]/50 bg-[#199026]/20 px-2 py-0.5 font-mono text-xs text-[#3fbf4f]">
                  Android App
                </span>
                <h3 className="truncate font-mono font-bold text-slate-100">
                  MagDisplay
                </h3>
              </div>
              <p className="mt-1 truncate text-sm text-slate-400">
                充電中をスマートディスプレイに変える Android
                スクリーンセーバーアプリ。専用ページで詳しく紹介しています。
              </p>
            </div>
            <ArrowRight className="size-5 flex-shrink-0 text-[#3fbf4f] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Projects Content */}
      <ProjectsSection />
      <Footer />
    </div>
  );
}
