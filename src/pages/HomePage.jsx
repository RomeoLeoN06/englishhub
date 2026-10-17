import { Link } from 'react-router-dom';
import { useCategoryModal } from '../context/CategoryModalContext';

export default function HomePage() {
  const {
    openCategoryModal,
    categoryStats,
    categories,
    levels,
    totalWords,
  } = useCategoryModal();

  const totalCategories = categories.length;
  const totalLevels = levels.length;

  // Curated popular categories for quick access strip
  const popularCategories = categories.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1>
          İngilizce Öğrenmenin
          <br />
          <span className="gradient-text">En Eğlenceli Yolu</span>
        </h1>
        <p>
          100.000 kelimelik devasa sözlük, görsellerle desteklenmiş kelime kartları, interaktif quizler ve seviyene
          uygun içeriklerle İngilizceni geliştir.
        </p>

        {/* Hero Actions (Balanced 2 Main Buttons) */}
        <div className="hero-actions">
          <Link to="/learn" className="btn btn-primary" id="start-learning-btn">
            🚀 Öğrenmeye Başla
          </Link>
          <Link to="/quiz" className="btn btn-secondary" id="take-quiz-btn">
            🧠 Quiz Çöz
          </Link>
        </div>

        {/* Hero Features */}
        <div className="hero-features">
          <div className="hero-feature">
            <div className="hero-feature-icon">🃏</div>
            <span className="hero-feature-label">Flashcardlar</span>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-icon">🧠</div>
            <span className="hero-feature-label">Quizler</span>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-icon">📊</div>
            <span className="hero-feature-label">Seviye Takibi</span>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-icon">🎨</div>
            <span className="hero-feature-label">Görseller</span>
          </div>
        </div>
      </section>

      {/* Stats (with clickable Categories card) */}
      <div className="stats-grid">
        <Link to="/learn" className="stat-card stat-card-clickable" title="Tüm kelimelere git">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{totalWords.toLocaleString('tr-TR')}</div>
          <div className="stat-label">Toplam Kelime</div>
        </Link>
        <div
          className="stat-card stat-card-clickable stat-card-category-highlight"
          onClick={() => openCategoryModal()}
          title="Kategorileri Aç (Kısayol: K)"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') openCategoryModal();
          }}
        >
          <div className="stat-icon">📂</div>
          <div className="stat-value">{totalCategories}</div>
          <div className="stat-label">
            Kategori <span className="stat-action-hint">Göz At ↗</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{totalLevels}</div>
          <div className="stat-label">CEFR Seviyesi</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">3</div>
          <div className="stat-label">Öğrenme Modu</div>
        </div>
      </div>

      {/* Categories Section Header */}
      <div className="page-header">
        <h1>Kategoriler</h1>
        <p>Bir kategori seç ve öğrenmeye başla!</p>
      </div>

      {/* Category Grid */}
      <div className="category-grid">
        {categories.map((cat) => {
          const catData = categoryStats[cat.id] || { total: 0, levels: {} };
          const wordCount = catData.total;
          const levelCounts = levels.map((l) => ({
            ...l,
            count: catData.levels[l.id] || 0,
          }));

          return (
            <Link
              to={`/learn?category=${cat.id}`}
              key={cat.id}
              className="category-card"
              id={`category-${cat.id}`}
              style={{ '--cat-color': cat.color }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: cat.gradient,
                  borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                }}
              />
              <div className="category-icon">{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
              <div className="category-name-en">{cat.nameEn}</div>
              <div className="category-stats">
                <span>{wordCount.toLocaleString('tr-TR')} kelime</span>
                <span>•</span>
                {levelCounts
                  .filter((l) => l.count > 0)
                  .map((l) => (
                    <span
                      key={l.id}
                      className="category-stat-badge"
                      style={{ color: l.color, borderColor: l.color }}
                    >
                      {l.id}
                    </span>
                  ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
