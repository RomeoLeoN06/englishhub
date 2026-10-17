import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Particles from './components/Particles';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import QuizPage from './pages/QuizPage';
import { CategoryModalProvider, useCategoryModal } from './context/CategoryModalContext';
import CategoryExplorerModal from './components/CategoryExplorerModal';

export default function App() {
  return (
    <CategoryModalProvider>
      <div className="app-layout">
        <Particles />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/quiz" element={<QuizPage />} />
          </Routes>
        </main>
        <CategoryExplorerModal />
      </div>
    </CategoryModalProvider>
  );
}
