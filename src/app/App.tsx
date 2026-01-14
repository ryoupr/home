import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ToolsPage } from './pages/ToolsPage';
import { SampleToolPage } from './pages/tools/SampleToolPage';
import { CsvGraphViewerPage } from './pages/tools/CsvGraphViewerPage';

export default function App() {
  return (
    <BrowserRouter basename="/home">
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/sample" element={<SampleToolPage />} />
        <Route path="/tools/csv-graph-viewer" element={<CsvGraphViewerPage />} />
      </Routes>
    </BrowserRouter>
  );
}