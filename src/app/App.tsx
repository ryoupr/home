import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ToolsPage } from './pages/ToolsPage';
import { SampleToolPage } from './pages/tools/SampleToolPage';
import { CsvGraphViewerPage } from './pages/tools/CsvGraphViewerPage';
import IconGeneratorPage from './pages/tools/IconGeneratorPage';
import { YabaneSchedulePage } from './pages/tools/YabaneSchedulePage';
import { SlideBuilderPage } from './pages/tools/SlideBuilderPage';
import { BoxNoteConverterPage } from './pages/tools/BoxNoteConverterPage';

export default function App() {
  return (
    <BrowserRouter basename="/home">
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/sample" element={<SampleToolPage />} />
        <Route path="/tools/csv-graph-viewer" element={<CsvGraphViewerPage />} />
        <Route path="/tools/icon-generator" element={<IconGeneratorPage />} />
        <Route path="/tools/yabane-schedule" element={<YabaneSchedulePage />} />
        <Route path="/tools/slide-builder" element={<SlideBuilderPage />} />
        <Route path="/tools/boxnote-converter" element={<BoxNoteConverterPage />} />
      </Routes>
    </BrowserRouter>
  );
}