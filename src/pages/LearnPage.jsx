import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import wordsData, { categories, levels } from '../data/words';
import { CategoryModal, LevelModal } from '../components/FilterModals';

function WordModal({ word, onClose }) {
  if (!word) return null;
  const levelInfo = levels.find((l) => l.id === word.level);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-emoji">{word.emoji}</div>
        <div className="modal-word">{word.en}</div>
        <div className="modal-translation">{word.tr}</div>
        <span
          className="word-card-level"
          style={{
            background: `${levelInfo?.color}22`,
            color: levelInfo?.color,
            display: 'inline-block',
            marginBottom: '16px',
          }}
        >
          {levelInfo?.icon} {word.level}
        </span>
        <div className="modal-example">"{word.example}"</div>
        <button className="modal-close" onClick={onClose}>
          Kapat
        </button>
      </div>
    </div>
  );
}

function speakWord(text, lang = 'en-US', e) {
  if (e) e.stopPropagation();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

function Flashcard({ words }) {
  const [deck, setDeck] = useState(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState('en-to-tr'); // 'en-to-tr', 'tr-to-en', 'mixed'
  const [knownWords, setKnownWords] = useState(new Set());
  const [unknownWords, setUnknownWords] = useState(new Set());

  // Reset or update deck when words list changes
  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  const currentWord = deck[currentIndex];
  const levelInfo = levels.find((l) => l.id === currentWord?.level);
  const progress = deck.length > 0 ? ((currentIndex + 1) / deck.length) * 100 : 0;

  // Determine direction for current card
  const isTrFront = useMemo(() => {
    if (direction === 'tr-to-en') return true;
    if (direction === 'en-to-tr') return false;
    // In mixed mode, alternate based on index
    return currentIndex % 2 === 1;
  }, [direction, currentIndex]);

  const handleFlip = useCallback((e) => {
    if (e && e.target && e.target.closest('.flashcard-audio-btn')) return;
    setIsFlipped((f) => !f);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, deck.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleKnown = useCallback(() => {
    if (!currentWord) return;
    setKnownWords((prev) => new Set(prev).add(currentWord.id));
    setUnknownWords((prev) => {
      const next = new Set(prev);
      next.delete(currentWord.id);
      return next;
    });
    handleNext();
  }, [currentWord, handleNext]);

  const handleUnknown = useCallback(() => {
    if (!currentWord) return;
    setUnknownWords((prev) => new Set(prev).add(currentWord.id));
    setKnownWords((prev) => {
      const next = new Set(prev);
      next.delete(currentWord.id);
      return next;
    });
    handleNext();
  }, [currentWord, handleNext]);

  const handleShuffle = useCallback(() => {
    setDeck((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowUp') {
        handleKnown();
      } else if (e.key === 'ArrowDown') {
        handleUnknown();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleKnown, handleUnknown]);

  if (!currentWord) {
    return (
      <div className="empty-state">
        <span className="empty-state-emoji">📭</span>
        <h3>Bu filtreye uygun kelime bulunamadı</h3>
      </div>
    );
  }

  return (
    <div className="flashcard-container">
      {/* Direction Pills (English-Turkish / Turkish-English / Mixed) */}
      <div className="flashcard-direction-bar">
        <button
          type="button"
          className={`flashcard-dir-btn ${direction === 'en-to-tr' ? 'active' : ''}`}
          onClick={() => {
            setDirection('en-to-tr');
            setIsFlipped(false);
          }}
          title="İngilizce kelimeyi gör, Türkçesini tahmin et"
        >
          🇬🇧 ➔ 🇹🇷 İngilizce
        </button>
        <button
          type="button"
          className={`flashcard-dir-btn ${direction === 'tr-to-en' ? 'active' : ''}`}
          onClick={() => {
            setDirection('tr-to-en');
            setIsFlipped(false);
          }}
          title="Türkçe kelimeyi gör, İngilizcesini tahmin et"
        >
          🇹🇷 ➔ 🇬🇧 Türkçe
        </button>
        <button
          type="button"
          className={`flashcard-dir-btn ${direction === 'mixed' ? 'active' : ''}`}
          onClick={() => {
            setDirection('mixed');
            setIsFlipped(false);
          }}
          title="İki dilden karışık kartlar"
        >
          🔀 Karışık
        </button>
      </div>

      {/* Progress & Counters */}
      <div className="flashcard-progress">
        <span>
          {currentIndex + 1} / {deck.length}
        </span>
        <div className="flashcard-progress-bar">
          <div className="flashcard-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--success)' }} title="Öğrenildi">
            ✅ {knownWords.size}
          </span>
          <span style={{ color: 'var(--danger)' }} title="Tekrar edilecek">
            ❌ {unknownWords.size}
          </span>
        </div>
      </div>

      {/* Flashcard 3D Card */}
      <div className="flashcard-wrapper" onClick={handleFlip}>
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
          {/* Front Face */}
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-lang-tag">
              {isTrFront ? '🇹🇷 Türkçe' : '🇬🇧 İngilizce'}
            </span>
            <span
              className="flashcard-level-badge"
              style={{
                background: `${levelInfo?.color}22`,
                color: levelInfo?.color,
              }}
            >
              {levelInfo?.icon} {currentWord.level}
            </span>
            <div className="flashcard-emoji">{currentWord.emoji}</div>
            <div className="flashcard-word-row">
              <div className="flashcard-word">
                {isTrFront ? currentWord.tr : currentWord.en}
              </div>
              {!isTrFront && (
                <button
                  type="button"
                  className="flashcard-audio-btn"
                  onClick={(e) => speakWord(currentWord.en, 'en-US', e)}
                  title="Telaffuz Dinle"
                >
                  🔊
                </button>
              )}
            </div>
            <div className="flashcard-hint">👆 Çevirmek için tıkla (Boşluk)</div>
          </div>

          {/* Back Face */}
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-lang-tag">
              {isTrFront ? '🇬🇧 İngilizce' : '🇹🇷 Türkçe'}
            </span>
            <span
              className="flashcard-level-badge"
              style={{
                background: `${levelInfo?.color}22`,
                color: levelInfo?.color,
              }}
            >
              {levelInfo?.icon} {currentWord.level}
            </span>
            <div className="flashcard-emoji">{currentWord.emoji}</div>
            <div className="flashcard-word-row">
              <div className="flashcard-word">
                {isTrFront ? currentWord.en : currentWord.tr}
              </div>
              {isTrFront && (
                <button
                  type="button"
                  className="flashcard-audio-btn"
                  onClick={(e) => speakWord(currentWord.en, 'en-US', e)}
                  title="Telaffuz Dinle"
                >
                  🔊
                </button>
              )}
            </div>
            <div className="flashcard-translation">
              {isTrFront ? currentWord.tr : currentWord.en}
            </div>
            {currentWord.example && (
              <div className="flashcard-example">"{currentWord.example}"</div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flashcard-controls">
        <button
          className="flashcard-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          title="Önceki (Sol Ok)"
        >
          ◀
        </button>
        <button
          className="flashcard-btn unknown"
          onClick={handleUnknown}
          title="Bilmiyorum / Tekrar Et (Aşağı Ok)"
        >
          ✗
        </button>
        <button
          className="flashcard-btn flip-action"
          onClick={handleFlip}
          title="Kartı Çevir (Boşluk)"
        >
          🔄
        </button>
        <button
          className="flashcard-btn known"
          onClick={handleKnown}
          title="Biliyorum (Yukarı Ok)"
        >
          ✓
        </button>
        <button
          className="flashcard-btn"
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          title="Sonraki (Sağ Ok)"
        >
          ▶
        </button>
        <button
          className="flashcard-btn shuffle-action"
          onClick={handleShuffle}
          title="Kartları Karıştır"
        >
          🔀
        </button>
      </div>
    </div>
  );
}

function WordList({ words }) {
  const [selectedWord, setSelectedWord] = useState(null);
  const [visibleCount, setVisibleCount] = useState(60);

  if (words.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-emoji">📭</span>
        <h3>Bu filtreye uygun kelime bulunamadı</h3>
      </div>
    );
  }

  const displayedWords = words.slice(0, visibleCount);

  return (
    <>
      <div className="words-meta-bar">
        <span>
          Toplam <strong>{words.length}</strong> kelimeden <strong>{displayedWords.length}</strong> tanesi listeleniyor
        </span>
      </div>

      <div className="word-list">
        {displayedWords.map((word) => {
          const levelInfo = levels.find((l) => l.id === word.level);
          return (
            <div
              key={word.id}
              className="word-card"
              id={`word-${word.id}`}
              onClick={() => setSelectedWord(word)}
            >
              <div className="word-card-emoji">{word.emoji}</div>
              <div className="word-card-content">
                <div className="word-card-en">{word.en}</div>
                <div className="word-card-tr">{word.tr}</div>
                <div className="word-card-example">"{word.example}"</div>
              </div>
              <span
                className="word-card-level"
                style={{
                  background: `${levelInfo?.color}22`,
                  color: levelInfo?.color,
                }}
              >
                {word.level}
              </span>
            </div>
          );
        })}
      </div>

      {visibleCount < words.length && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={() => setVisibleCount((prev) => Math.min(prev + 60, words.length))}
          >
            Daha Fazla Göster ({words.length - visibleCount} kelime kaldı)
          </button>
        </div>
      )}

      {selectedWord && <WordModal word={selectedWord} onClose={() => setSelectedWord(null)} />}
    </>
  );
}

export default function LearnPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeLevel, setActiveLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('list'); // 'list' or 'flashcard'

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  const categoryCounts = useMemo(() => {
    const map = {};
    for (let i = 0; i < wordsData.length; i++) {
      const c = wordsData[i].category;
      map[c] = (map[c] || 0) + 1;
    }
    return map;
  }, []);

  const levelCounts = useMemo(() => {
    const map = {};
    for (let i = 0; i < wordsData.length; i++) {
      const l = wordsData[i].level;
      map[l] = (map[l] || 0) + 1;
    }
    return map;
  }, []);

  const activeCatObj = categories.find((c) => c.id === activeCategory);
  const activeLvlObj = levels.find((l) => l.id === activeLevel);

  const filteredWords = useMemo(() => {
    let result = wordsData;
    if (activeCategory !== 'all') {
      result = result.filter((w) => w.category === activeCategory);
    }
    if (activeLevel !== 'all') {
      result = result.filter((w) => w.level === activeLevel);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (w) => w.en.toLowerCase().includes(q) || w.tr.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, activeLevel, searchTerm]);

  return (
    <div>
      <Link to="/" className="back-btn">
        ← Geri Dön
      </Link>

      <div className="page-header">
        <h1>📚 Kelime Öğren</h1>
        <p>100.000 kelimelik devasa havuzda arama yap, kategori ve seviyeye göre öğren</p>
      </div>

      {/* Mode Tabs */}
      <div className="mode-tabs">
        <button
          className={`mode-tab ${mode === 'list' ? 'active' : ''}`}
          onClick={() => setMode('list')}
        >
          📋 Liste
        </button>
        <button
          className={`mode-tab ${mode === 'flashcard' ? 'active' : ''}`}
          onClick={() => setMode('flashcard')}
        >
          🃏 Flashcard
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="İngilizce veya Türkçe kelime ara... (örn: apple, ev, run)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Temizle"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Akıllı Kompakt Filtre Butonları */}
      <div className="learn-filter-bar">
        {/* Kategori Seçici */}
        <button
          type="button"
          className={`learn-filter-btn ${activeCategory !== 'all' ? 'active-filter' : ''}`}
          onClick={() => setIsCategoryModalOpen(true)}
          id="learn-category-btn"
        >
          <span className="learn-filter-btn-icon">
            {activeCategory === 'all' ? '📂' : activeCatObj?.icon || '📂'}
          </span>
          <span className="learn-filter-btn-text">
            {activeCategory === 'all' ? 'Kategori: Tümü' : activeCatObj?.name}
          </span>
          <span className="learn-filter-btn-badge">
            {activeCategory === 'all'
              ? `${wordsData.length.toLocaleString('tr-TR')}`
              : `${(categoryCounts[activeCategory] || 0).toLocaleString('tr-TR')}`}
          </span>
          <span className="learn-filter-btn-chevron">▾</span>
        </button>

        {/* Seviye Seçici */}
        <button
          type="button"
          className={`learn-filter-btn ${activeLevel !== 'all' ? 'active-filter' : ''}`}
          onClick={() => setIsLevelModalOpen(true)}
          id="learn-level-btn"
        >
          <span className="learn-filter-btn-icon">
            {activeLevel === 'all' ? '📈' : activeLvlObj?.icon || '📈'}
          </span>
          <span className="learn-filter-btn-text">
            {activeLevel === 'all' ? 'Seviye: Tümü' : `${activeLvlObj?.id} (${activeLvlObj?.name})`}
          </span>
          <span className="learn-filter-btn-badge">
            {activeLevel === 'all'
              ? 'A1-C2'
              : `${(levelCounts[activeLevel] || 0).toLocaleString('tr-TR')}`}
          </span>
          <span className="learn-filter-btn-chevron">▾</span>
        </button>

        {/* Filtreleri Sıfırla (Aktif filtre varsa) */}
        {(activeCategory !== 'all' || activeLevel !== 'all') && (
          <button
            type="button"
            className="learn-filter-reset-btn"
            onClick={() => {
              setActiveCategory('all');
              setActiveLevel('all');
            }}
            title="Filtreleri Sıfırla"
          >
            Sıfırla ✕
          </button>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={(catId) => setActiveCategory(catId)}
        categoryCounts={categoryCounts}
      />

      {/* Level Modal */}
      <LevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        activeLevel={activeLevel}
        onSelectLevel={(lvlId) => setActiveLevel(lvlId)}
        levelCounts={levelCounts}
      />

      {/* Content */}
      {mode === 'list' ? (
        <WordList key={`${activeCategory}-${activeLevel}-${searchTerm}`} words={filteredWords} />
      ) : (
        <Flashcard words={filteredWords} />
      )}
    </div>
  );
}
