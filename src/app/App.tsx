import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ToolsPage } from './pages/ToolsPage';
import { SampleToolPage } from './pages/tools/SampleToolPage';

export default function App() {
  return (
    <BrowserRouter basename="/home">
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/sample" element={<SampleToolPage />} />
      </Routes>
    </BrowserRouter>
  );
}