import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoryModal } from '../context/useCategoryModal';

function CategoryExplorerModalDialog() {
  const {
    closeCategoryModal,
    categories,
    levels,
    categoryStats,
    totalWords,
    initialSearch,
  } = useCategoryModal();

  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Focus input and lock body scrolling on mount
  useEffect(() => {
    searchInputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const filteredCategories = useMemo(() => {
    let result = categories.map((cat) => {
      const stats = categoryStats[cat.id] || { total: 0, levels: {} };
      return {
        ...cat,
        stats,
        totalInCat: stats.total,
      };
    });

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q)
      );
    }

    // Level filter
    if (selectedLevel !== 'all') {
      result = result.filter((c) => (c.stats.levels[selectedLevel] || 0) > 0);
    }

    return result;
  }, [categories, categoryStats, searchTerm, selectedLevel]);

  const handleSelectCategory = (catId) => {
    closeCategoryModal();
    navigate(`/learn?category=${catId}`);
  };

  return (
    <div
      className="cat-modal-overlay"
      onClick={closeCategoryModal}
      role="dialog"
      aria-modal="true"
      aria-label="Kategori Gezgini"
    >
      <div
        className="cat-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cat-modal-header">
          <div className="cat-modal-header-left">
            <span className="cat-modal-header-icon">📂</span>
            <div>
              <div className="cat-modal-title-row">
                <h2 className="cat-modal-title">Kategoriler</h2>
                <span className="cat-modal-count-pill">{categories.length} Alan</span>
                <span className="cat-modal-count-pill">{totalWords.toLocaleString('tr-TR')} Kelime</span>
              </div>
              <p className="cat-modal-subtitle">
                Çalışmak istediğin alanı seç veya ara
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cat-modal-close-btn"
            onClick={closeCategoryModal}
            aria-label="Kapat"
            title="Kapat (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="cat-modal-toolbar">
          <div className="cat-modal-search-wrapper">
            <span className="cat-modal-search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              className="cat-modal-search-input"
              placeholder="Kategori ara (örn: Mühendislik, Bilişim, Sağlık, Hukuk)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="cat-modal-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Aramayı temizle"
              >
                ✕
              </button>
            )}
          </div>

          {/* Level Filter Chips */}
          <div className="cat-modal-levels-bar">
            <span className="cat-modal-levels-label">Seviye:</span>
            <button
              type="button"
              className={`cat-modal-lvl-chip ${selectedLevel === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedLevel('all')}
            >
              Tümü
            </button>
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                className={`cat-modal-lvl-chip ${selectedLevel === lvl.id ? 'active' : ''}`}
                style={{ '--chip-color': lvl.color }}
                onClick={() => setSelectedLevel(lvl.id)}
              >
                <span>{lvl.icon}</span>
                <span>{lvl.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid (Scrollable, fits within dialog) */}
        <div className="cat-modal-body">
          {filteredCategories.length === 0 ? (
            <div className="cat-modal-empty">
              <span className="cat-modal-empty-icon">🔍</span>
              <h3>Kategori bulunamadı</h3>
              <p>Arama teriminizi değiştirip tekrar deneyebilirsiniz.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLevel('all');
                }}
              >
                Tümünü Göster
              </button>
            </div>
          ) : (
            <div className="cat-modal-grid">
              {filteredCategories.map((cat) => {
                const count = cat.totalInCat;
                return (
                  <div
                    key={cat.id}
                    className="cat-modal-card"
                    style={{ '--cat-color': cat.color }}
                    onClick={() => handleSelectCategory(cat.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectCategory(cat.id);
                    }}
                    title={`${cat.name} (${cat.nameEn}) - ${count.toLocaleString('tr-TR')} kelime`}
                  >
                    <div
                      className="cat-modal-card-top-line"
                      style={{ background: cat.gradient }}
                    />
                    <div className="cat-modal-card-icon-wrap">
                      <span className="cat-modal-card-icon">{cat.icon}</span>
                    </div>
                    <div className="cat-modal-card-content">
                      <h4 className="cat-modal-card-name">{cat.name}</h4>
                      <span className="cat-modal-card-en">{cat.nameEn}</span>
                      <div className="cat-modal-card-badge">
                        {count.toLocaleString('tr-TR')} kelime
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="cat-modal-footer">
          <button
            type="button"
            className="cat-modal-all-link"
            onClick={() => {
              closeCategoryModal();
              navigate('/learn?category=all');
            }}
          >
            <span>🌐 Tüm Genel Sözlük ({totalWords.toLocaleString('tr-TR')} Kelime)</span>
            <span>➔</span>
          </button>

          <div className="cat-modal-footer-right">
            <span className="cat-modal-hint-text">
              Kısayol: <kbd className="cat-modal-kbd">K</kbd> veya <kbd className="cat-modal-kbd">ESC</kbd>
            </span>
            <button
              type="button"
              className="cat-modal-footer-btn"
              onClick={closeCategoryModal}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryExplorerModal() {
  const { isOpen } = useCategoryModal();
  if (!isOpen) return null;
  return <CategoryExplorerModalDialog />;
}
