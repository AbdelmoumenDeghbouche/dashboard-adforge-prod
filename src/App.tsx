import { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import AiAvatarsPage from './pages/AiAvatarsPage';

export type PageType = 'home' | 'ai-avatars';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'ai-avatars':
        return <AiAvatarsPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
}

export default App;
