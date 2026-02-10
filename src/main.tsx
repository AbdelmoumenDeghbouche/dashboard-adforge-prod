import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthProvider';
import { BrandProvider } from './contexts/BrandContext';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <BrandProvider>
      <App />
    </BrandProvider>
  </AuthProvider>
);
