import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import wordsData, { categories, levels } from '../data/words';

export const CategoryModalContext = createContext(null);

export function CategoryModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialSearch, setInitialSearch] = useState('');

  // Compute category stats once across the whole application
  const categoryStats = useMemo(() => {
    const map = {};
    for (const cat of categories) {
      map[cat.id] = { total: 0, levels: {} };
      for (const lvl of levels) {
        map[cat.id].levels[lvl.id] = 0;
      }
    }
    for (let i = 0; i < wordsData.length; i++) {
      const w = wordsData[i];
      if (map[w.category]) {
        map[w.category].total++;
        if (map[w.category].levels[w.level] !== undefined) {
          map[w.category].levels[w.level]++;
        }
      }
    }
    return map;
  }, []);

  const openCategoryModal = useCallback((search = '') => {
    setInitialSearch(typeof search === 'string' ? search : '');
    setIsOpen(true);
  }, []);

  const closeCategoryModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCategoryModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Keyboard shortcut: Press 'K' or 'k' (unless typing in input/textarea)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger when user is typing in form inputs
      const activeTag = document.activeElement?.tagName;
      const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable;

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeCategoryModal();
        return;
      }

      if ((e.key === 'k' || e.key === 'K') && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleCategoryModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCategoryModal, toggleCategoryModal]);

  return (
    <CategoryModalContext.Provider
      value={{
        isOpen,
        openCategoryModal,
        closeCategoryModal,
        toggleCategoryModal,
        categoryStats,
        categories,
        levels,
        totalWords: wordsData.length,
        initialSearch,
      }}
    >
      {children}
    </CategoryModalContext.Provider>
  );
}

export { useCategoryModal } from './useCategoryModal';

