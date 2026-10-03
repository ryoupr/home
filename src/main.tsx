import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { initMode } from './app/theme/mode';
import './styles/index.css';

initMode();

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');
createRoot(root).render(<App />);
