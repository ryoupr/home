import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProjectsSection } from '../components/ProjectsSection';
import { Footer } from '../components/Footer';

export function ProjectsPage() {
  useEffect(() => { document.title = 'Projects | ryoupr'; }, []);
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

      {/* Projects Content */}
      <ProjectsSection />
      <Footer />
    </div>
  );
}
