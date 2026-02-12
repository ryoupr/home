import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ToolsPage } from './pages/ToolsPage';
import { BoxNoteConverterPage } from './pages/tools/BoxNoteConverterPage';
import { CsvGraphViewerPage } from './pages/tools/CsvGraphViewerPage';
import { SampleToolPage } from './pages/tools/SampleToolPage';
import { SlideBuilderPage } from './pages/tools/SlideBuilderPage';
import { YabaneSchedulePage } from './pages/tools/YabaneSchedulePage';

const IconGeneratorPage = React.lazy(
  () => import('./pages/tools/IconGeneratorPage')
);

export default function App() {
  return (
    <BrowserRouter basename="/home">
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/sample" element={<SampleToolPage />} />
        <Route
          path="/tools/csv-graph-viewer"
          element={<CsvGraphViewerPage />}
        />
        <Route
          path="/tools/icon-generator"
          element={
            <Suspense
              fallback={<div className="p-8 text-center">Loading...</div>}
            >
              <IconGeneratorPage />
            </Suspense>
          }
        />
        <Route path="/tools/yabane-schedule" element={<YabaneSchedulePage />} />
        <Route path="/tools/slide-builder" element={<SlideBuilderPage />} />
        <Route
          path="/tools/boxnote-converter"
          element={<BoxNoteConverterPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
