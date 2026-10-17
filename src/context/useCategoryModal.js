import { useContext } from 'react';
import { CategoryModalContext } from './CategoryModalContext';

export function useCategoryModal() {
  const context = useContext(CategoryModalContext);
  if (!context) {
    throw new Error('useCategoryModal must be used within a CategoryModalProvider');
  }
  return context;
}
