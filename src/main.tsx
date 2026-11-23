import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { TransportProvider } from '@/features/chat/TransportContext';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <TransportProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </TransportProvider>
    </MotionConfig>
  </StrictMode>,
);
