import { lazy, Suspense, Component, type ReactNode, type ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage').then(m => ({ default: m.ToolsPage })));
const SampleToolPage = lazy(() => import('./pages/tools/SampleToolPage').then(m => ({ default: m.SampleToolPage })));
const CsvGraphViewerPage = lazy(() => import('./pages/tools/CsvGraphViewerPage').then(m => ({ default: m.CsvGraphViewerPage })));
const IconGeneratorPage = lazy(() => import('./pages/tools/IconGeneratorPage'));
const YabaneSchedulePage = lazy(() => import('./pages/tools/YabaneSchedulePage').then(m => ({ default: m.YabaneSchedulePage })));
const SlideBuilderPage = lazy(() => import('./pages/tools/SlideBuilderPage').then(m => ({ default: m.SlideBuilderPage })));

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">エラーが発生しました</h1>
            <p className="text-slate-400">ページを再読み込みしてください。</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500">再読み込み</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="text-cyan-400 animate-pulse">Loading...</div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/home">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<ProfilePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/sample" element={<SampleToolPage />} />
            <Route path="/tools/csv-graph-viewer" element={<CsvGraphViewerPage />} />
            <Route path="/tools/icon-generator" element={<IconGeneratorPage />} />
            <Route path="/tools/yabane-schedule" element={<YabaneSchedulePage />} />
            <Route path="/tools/slide-builder" element={<SlideBuilderPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
