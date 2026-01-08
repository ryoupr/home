import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectsSection } from './components/ProjectsSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="size-full bg-slate-950">
      <Header />
      <Hero />
      <ProjectsSection />
      <Footer />
    </div>
  );
}