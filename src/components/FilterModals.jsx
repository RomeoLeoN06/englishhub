import { useState } from 'react';
import wordsData, { categories, levels } from '../data/words';

export function CategoryModal({ isOpen, onClose, activeCategory, onSelectCategory, categoryCounts }) {
  const [searchTerm, setSearchTerm] = useState('');
  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quiz-filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quiz-modal-header">
          <div>
            <h3>📂 Kategori Seç</h3>
            <p>100.000 kelimelik havuzdan çalışmak istediğin alanı seç</p>
          </div>
          <button className="quiz-modal-close-btn" onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </div>

        {/* Modal Search Bar */}
        <div className="quiz-modal-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Kategori ara (örn: Mühendislik, Sağlık, Hukuk, Bilim)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>

        {/* Category Items Grid */}
        <div className="quiz-modal-grid">
          {/* Tümü Seçeneği */}
          <button
            type="button"
            className={`quiz-modal-card ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
          >
            <div className="quiz-modal-card-icon">📂</div>
            <div className="quiz-modal-card-info">
              <div className="quiz-modal-card-title">Tüm Kategoriler</div>
              <div className="quiz-modal-card-subtitle">
                {wordsData.length.toLocaleString('tr-TR')} Kelime • Genel Havuz
              </div>
            </div>
            {activeCategory === 'all' && <span className="quiz-modal-check">✓</span>}
          </button>

          {filteredCategories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`quiz-modal-card ${isSelected ? 'active' : ''}`}
                style={{ '--card-accent': cat.color }}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onClose();
                }}
              >
                <div className="quiz-modal-card-icon">{cat.icon}</div>
                <div className="quiz-modal-card-info">
                  <div className="quiz-modal-card-title">{cat.name}</div>
                  <div className="quiz-modal-card-subtitle">
                    {count.toLocaleString('tr-TR')} Kelime • {cat.nameEn}
                  </div>
                </div>
                {isSelected && <span className="quiz-modal-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LevelModal({ isOpen, onClose, activeLevel, onSelectLevel, levelCounts }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quiz-filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quiz-modal-header">
          <div>
            <h3>📈 Zorluk Seviyesi Seç</h3>
            <p>Seviyene en uygun kelimelerle pratik yap</p>
          </div>
          <button className="quiz-modal-close-btn" onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </div>

        <div className="quiz-modal-grid single-col">
          {/* Tüm Seviyeler */}
          <button
            type="button"
            className={`quiz-modal-card ${activeLevel === 'all' ? 'active' : ''}`}
            onClick={() => {
              onSelectLevel('all');
              onClose();
            }}
          >
            <div className="quiz-modal-card-icon">📈</div>
            <div className="quiz-modal-card-info">
              <div className="quiz-modal-card-title">Tüm Seviyeler</div>
              <div className="quiz-modal-card-subtitle">A1'den C2'ye karışık zorluk</div>
            </div>
            {activeLevel === 'all' && <span className="quiz-modal-check">✓</span>}
          </button>

          {levels.map((lvl) => {
            const count = levelCounts[lvl.id] || 0;
            const isSelected = activeLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                className={`quiz-modal-card ${isSelected ? 'active' : ''}`}
                style={{ '--card-accent': lvl.color }}
                onClick={() => {
                  onSelectLevel(lvl.id);
                  onClose();
                }}
              >
                <div className="quiz-modal-card-icon">{lvl.icon}</div>
                <div className="quiz-modal-card-info">
                  <div className="quiz-modal-card-title" style={{ color: lvl.color }}>
                    {lvl.id} - {lvl.name} ({lvl.nameEn})
                  </div>
                  <div className="quiz-modal-card-subtitle">
                    {count.toLocaleString('tr-TR')} Kelime
                  </div>
                </div>
                {isSelected && <span className="quiz-modal-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
