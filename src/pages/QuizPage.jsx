import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import wordsData, { categories, levels } from '../data/words';
import { CategoryModal, LevelModal } from '../components/FilterModals';

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function speakWord(text) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

// Generate EXACTLY 3 unique options (1 correct + 2 smart distractors)
function generateOptions(correctWord, allWords, direction) {
  const isTrQuestion = direction === 'tr-to-en';
  const correctAnswer = isTrQuestion ? correctWord.en : correctWord.tr;
  const options = [correctAnswer];

  // Try finding distractors preferably from the same category/level for higher pedagogical quality
  const sameContext = allWords.filter(
    (w) => w.id !== correctWord.id && (w.category === correctWord.category || w.level === correctWord.level)
  );
  const preferredPool = sameContext.length >= 10 ? sameContext : allWords;

  let attempts = 0;
  while (options.length < 3 && attempts < 100) {
    attempts++;
    const randomIdx = Math.floor(Math.random() * preferredPool.length);
    const candidateWord = preferredPool[randomIdx];
    if (!candidateWord) continue;
    const candidate = isTrQuestion ? candidateWord.en : candidateWord.tr;
    if (candidate && candidate.trim() && !options.includes(candidate)) {
      options.push(candidate);
    }
  }

  // Fallback to allWords if needed
  while (options.length < 3 && attempts < 200) {
    attempts++;
    const randomIdx = Math.floor(Math.random() * allWords.length);
    const candidate = isTrQuestion ? allWords[randomIdx]?.en : allWords[randomIdx]?.tr;
    if (candidate && candidate.trim() && !options.includes(candidate)) {
      options.push(candidate);
    }
  }

  return shuffleArray(options);
}

export default function QuizPage() {
  // Setup settings
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLevel, setActiveLevel] = useState('all');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState(10); // 10, 20, 50
  const [timerMode, setTimerMode] = useState('none'); // 'none', '15', '10'
  const [directionMode, setDirectionMode] = useState('en-to-tr'); // 'en-to-tr', 'tr-to-en', 'mixed'

  // Quiz active state
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const timerRef = useRef(null);

  const availableWords = useMemo(() => {
    let result = wordsData;
    if (activeCategory !== 'all') {
      result = result.filter((w) => w.category === activeCategory);
    }
    if (activeLevel !== 'all') {
      result = result.filter((w) => w.level === activeLevel);
    }
    return result;
  }, [activeCategory, activeLevel]);

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

  // Start new quiz
  const startQuiz = useCallback(
    (customWords = null) => {
      const sourcePool = customWords || availableWords;
      const shuffled = shuffleArray(sourcePool);
      const count = customWords ? customWords.length : Math.min(questionCount, shuffled.length);
      const quizWords = shuffled.slice(0, count);

      const qs = quizWords.map((word, idx) => {
        let qDirection = directionMode;
        if (directionMode === 'mixed') {
          qDirection = idx % 2 === 0 ? 'en-to-tr' : 'tr-to-en';
        }
        return {
          word,
          direction: qDirection,
          options: generateOptions(word, wordsData, qDirection),
          correctAnswer: qDirection === 'tr-to-en' ? word.en : word.tr,
        };
      });

      setQuestions(qs);
      setCurrentQuestion(0);
      setScore(0);
      setWrongCount(0);
      setCombo(0);
      setSelectedOption(null);
      setShowResult(false);
      setQuizFinished(false);
      setMissedQuestions([]);
      setIsTimedOut(false);
      setQuizStarted(true);

      if (timerMode !== 'none') {
        setTimeLeft(parseInt(timerMode, 10));
      }
    },
    [availableWords, questionCount, directionMode, timerMode]
  );

  // Restart with only missed questions (Spaced Repetition / Hata Defteri)
  const retryMissedQuestions = useCallback(() => {
    const missedWords = missedQuestions.map((mq) => mq.word);
    startQuiz(missedWords);
  }, [missedQuestions, startQuiz]);

  const maxTimer = timerMode !== 'none' ? parseInt(timerMode, 10) : 15;

  // Answer handler
  const handleAnswer = useCallback(
    (option, timeout = false) => {
      if (selectedOption !== null || showResult) return;

      clearInterval(timerRef.current);
      setSelectedOption(option);
      setIsTimedOut(timeout);

      const currentQ = questions[currentQuestion];
      const isCorrect = !timeout && option === currentQ.correctAnswer;

      if (isCorrect) {
        setScore((s) => s + 1);
        setCombo((c) => c + 1);
      } else {
        setWrongCount((w) => w + 1);
        setCombo(0);
        setMissedQuestions((prev) => [
          ...prev,
          {
            word: currentQ.word,
            direction: currentQ.direction,
            userChoice: timeout ? 'Süre Doldu' : option,
            correctAnswer: currentQ.correctAnswer,
          },
        ]);
      }

      setShowResult(true);

      // Auto-pronounce English word on answer
      if (currentQ.word?.en) {
        speakWord(currentQ.word.en);
      }

      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion((c) => c + 1);
          setSelectedOption(null);
          setShowResult(false);
          setIsTimedOut(false);
          if (timerMode !== 'none') {
            setTimeLeft(parseInt(timerMode, 10));
          }
        } else {
          setQuizFinished(true);
        }
      }, 1400);
    },
    [selectedOption, showResult, questions, currentQuestion, timerMode]
  );

  // Timer tick effect
  useEffect(() => {
    if (!quizStarted || quizFinished || showResult || timerMode === 'none') {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quizStarted, quizFinished, showResult, timerMode, currentQuestion, handleAnswer]);

  // Keyboard shortcut listener (1, 2, 3 or A, B, C)
  useEffect(() => {
    if (!quizStarted || quizFinished || showResult) return;
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      let index = -1;
      if (key === '1' || key === 'A') index = 0;
      else if (key === '2' || key === 'B') index = 1;
      else if (key === '3' || key === 'C') index = 2;

      if (index >= 0 && questions[currentQuestion]?.options[index]) {
        handleAnswer(questions[currentQuestion].options[index]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizStarted, quizFinished, showResult, questions, currentQuestion, handleAnswer]);

  const getResultMessage = () => {
    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    if (percentage === 100) return { emoji: '🏆', title: 'Kusursuz Başarı!', text: 'Tüm soruları doğru yanıtladın, harikasın!' };
    if (percentage >= 80) return { emoji: '🌟', title: 'Çok Başarılı!', text: 'Mükemmel bir performans sergiledin!' };
    if (percentage >= 60) return { emoji: '👏', title: 'İyi Gidiyorsun!', text: 'Güzel sonuç! Yanlışlarını tekrar ederek pekiştirebilirsin.' };
    if (percentage >= 40) return { emoji: '💪', title: 'Gelişmeye Devam!', text: 'Düzenli pratikle çok daha iyi olacaksın.' };
    return { emoji: '📖', title: 'Tekrar Zamanı!', text: 'Bu kelimeleri hata defterinden tekrar gözden geçir.' };
  };

  // --- SETUP SCREEN ---
  if (!quizStarted) {
    return (
      <div className="quiz-setup-container">
        <Link to="/" className="back-btn">
          ← Geri Dön
        </Link>

        <div className="page-header">
          <h1>🧠 Kelime Quizi</h1>
          <p>3 seçenekli, süreli ve aktif hatırlama yöntemleriyle kelime dağarcığını test et</p>
        </div>

        {/* 1. Soru Sayısı Seçimi */}
        <div className="quiz-setup-card">
          <div className="quiz-setup-title">
            <span>📝 Soru Sayısı</span>
          </div>
          <div className="quiz-pill-grid">
            <button
              className={`quiz-pill-btn ${questionCount === 10 ? 'active' : ''}`}
              onClick={() => setQuestionCount(10)}
            >
              <span>10 Soru</span>
              <span className="quiz-pill-subtitle">Hızlı Pratik</span>
            </button>
            <button
              className={`quiz-pill-btn ${questionCount === 20 ? 'active' : ''}`}
              onClick={() => setQuestionCount(20)}
            >
              <span>20 Soru</span>
              <span className="quiz-pill-subtitle">Standart Tur</span>
            </button>
            <button
              className={`quiz-pill-btn ${questionCount === 50 ? 'active' : ''}`}
              onClick={() => setQuestionCount(50)}
            >
              <span>50 Soru</span>
              <span className="quiz-pill-subtitle">Derin Öğrenme</span>
            </button>
          </div>
        </div>

        {/* 2. Süre Modu Seçimi */}
        <div className="quiz-setup-card">
          <div className="quiz-setup-title">
            <span>⏱️ Süre Modu</span>
          </div>
          <div className="quiz-pill-grid">
            <button
              className={`quiz-pill-btn ${timerMode === 'none' ? 'active' : ''}`}
              onClick={() => setTimerMode('none')}
            >
              <span>Süresiz 🧘</span>
              <span className="quiz-pill-subtitle">Rahat Öğrenme</span>
            </button>
            <button
              className={`quiz-pill-btn ${timerMode === '15' ? 'active' : ''}`}
              onClick={() => setTimerMode('15')}
            >
              <span>15 Saniye ⏱️</span>
              <span className="quiz-pill-subtitle">Dengeli Hız</span>
            </button>
            <button
              className={`quiz-pill-btn ${timerMode === '10' ? 'active' : ''}`}
              onClick={() => setTimerMode('10')}
            >
              <span>10 Saniye ⚡</span>
              <span className="quiz-pill-subtitle">Hızlı / Zorlu</span>
            </button>
          </div>
        </div>

        {/* 3. Soru Yönü (Pedagojik Öğretme Yöntemi) */}
        <div className="quiz-setup-card">
          <div className="quiz-setup-title">
            <span>🎯 Soru Yönü (Öğretme Yöntemi)</span>
          </div>
          <div className="quiz-pill-grid">
            <button
              className={`quiz-pill-btn ${directionMode === 'en-to-tr' ? 'active' : ''}`}
              onClick={() => setDirectionMode('en-to-tr')}
            >
              <span>🇬🇧 ➔ 🇹🇷 İngilizce ➔ Türkçe</span>
              <span className="quiz-pill-subtitle">Kelime Anlamı</span>
            </button>
            <button
              className={`quiz-pill-btn ${directionMode === 'tr-to-en' ? 'active' : ''}`}
              onClick={() => setDirectionMode('tr-to-en')}
            >
              <span>🇹🇷 ➔ 🇬🇧 Türkçe ➔ İngilizce</span>
              <span className="quiz-pill-subtitle">Aktif Hatırlama</span>
            </button>
            <button
              className={`quiz-pill-btn ${directionMode === 'mixed' ? 'active' : ''}`}
              onClick={() => setDirectionMode('mixed')}
            >
              <span>🔀 Karışık Mod</span>
              <span className="quiz-pill-subtitle">Çift Yönlü Pekiştirme</span>
            </button>
          </div>
        </div>

        {/* 4. Kategori & Seviye Seçimi (Modern Kompakt Seçiciler) */}
        <div className="quiz-selector-grid">
          {/* Kategori Seçim Butonu */}
          <button
            type="button"
            className="quiz-selector-tile"
            onClick={() => setIsCategoryModalOpen(true)}
            id="open-category-modal-btn"
          >
            <div className="quiz-selector-icon">
              {activeCategory === 'all' ? '📂' : activeCatObj?.icon || '📂'}
            </div>
            <div className="quiz-selector-content">
              <span className="quiz-selector-label">Kategori</span>
              <span className="quiz-selector-value">
                {activeCategory === 'all' ? 'Tüm Kategoriler' : activeCatObj?.name}
              </span>
              <span className="quiz-selector-count">
                {activeCategory === 'all'
                  ? `${wordsData.length.toLocaleString('tr-TR')} Kelime (Genel)`
                  : `${(categoryCounts[activeCategory] || 0).toLocaleString('tr-TR')} Kelime`}
              </span>
            </div>
            <div className="quiz-selector-chevron">
              <span>Seç</span>
              <span>▾</span>
            </div>
          </button>

          {/* Seviye Seçim Butonu */}
          <button
            type="button"
            className="quiz-selector-tile"
            onClick={() => setIsLevelModalOpen(true)}
            id="open-level-modal-btn"
          >
            <div className="quiz-selector-icon">
              {activeLevel === 'all' ? '📈' : activeLvlObj?.icon || '📈'}
            </div>
            <div className="quiz-selector-content">
              <span className="quiz-selector-label">Zorluk Seviyesi</span>
              <span className="quiz-selector-value">
                {activeLevel === 'all' ? 'Tüm Seviyeler' : `${activeLvlObj?.id} - ${activeLvlObj?.name}`}
              </span>
              <span className="quiz-selector-count">
                {activeLevel === 'all'
                  ? 'A1 - C2 Arası'
                  : `${(levelCounts[activeLevel] || 0).toLocaleString('tr-TR')} Kelime`}
              </span>
            </div>
            <div className="quiz-selector-chevron">
              <span>Seç</span>
              <span>▾</span>
            </div>
          </button>
        </div>

        {/* Category Selection Modal */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          activeCategory={activeCategory}
          onSelectCategory={(catId) => setActiveCategory(catId)}
          categoryCounts={categoryCounts}
        />

        {/* Level Selection Modal */}
        <LevelModal
          isOpen={isLevelModalOpen}
          onClose={() => setIsLevelModalOpen(false)}
          activeLevel={activeLevel}
          onSelectLevel={(lvlId) => setActiveLevel(lvlId)}
          levelCounts={levelCounts}
        />

        <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem', fontSize: '1.05rem' }}>
            Toplam <strong>{availableWords.length.toLocaleString('tr-TR')}</strong> kelime arasından{' '}
            <strong>{Math.min(questionCount, availableWords.length)}</strong> soruluk 3 seçenekli quiz
          </p>
          <button
            className="btn btn-primary"
            onClick={() => startQuiz()}
            disabled={availableWords.length < 3}
            id="start-quiz-btn"
            style={{ fontSize: '1.2rem', padding: '16px 48px' }}
          >
            🚀 Quize Başla ({Math.min(questionCount, availableWords.length)} Soru)
          </button>
          {availableWords.length < 3 && (
            <p style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.9rem' }}>
              Quiz için seçilen filtrede en az 3 kelime gerekli
            </p>
          )}
        </div>
      </div>
    );
  }

  // --- FINISH SCREEN ---
  if (quizFinished) {
    const result = getResultMessage();
    const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className="quiz-container">
        <div className="quiz-result glass-card">
          <div className="quiz-result-emoji">{result.emoji}</div>
          <h2>{result.title}</h2>
          <div className="quiz-result-score">
            {score}/{questions.length}
          </div>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
            Başarı Oranı: <strong>%{accuracy}</strong>
          </p>
          <p>{result.text}</p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {missedQuestions.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={retryMissedQuestions}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
              >
                📕 Yanlışları Tekrar Çöz ({missedQuestions.length})
              </button>
            )}
            <button className="btn btn-primary" onClick={() => startQuiz()}>
              🔄 Aynı Ayarlarla Tekrar
            </button>
            <button className="btn btn-secondary" onClick={() => setQuizStarted(false)}>
              ⚙️ Yeni Quiz Ayarla
            </button>
          </div>

          {/* Missed Questions Review */}
          {missedQuestions.length > 0 && (
            <div className="quiz-mistakes-section">
              <div className="quiz-mistakes-title">
                <span>📋 Yanlış Cevaplanan Kelimeler ({missedQuestions.length})</span>
              </div>
              <div className="quiz-mistake-list">
                {missedQuestions.map((mq, idx) => (
                  <div key={idx} className="quiz-mistake-item">
                    <div className="quiz-mistake-info">
                      <div className="quiz-mistake-word">
                        {mq.word.emoji} {mq.word.en}
                      </div>
                      <div className="quiz-mistake-tr">
                        Doğru: {mq.word.tr}{' '}
                        <span style={{ color: 'var(--danger)', fontWeight: 400 }}>
                          (Senin cevabın: {mq.userChoice})
                        </span>
                      </div>
                      <div className="quiz-mistake-example">"{mq.word.example}"</div>
                    </div>
                    <button
                      type="button"
                      className="audio-pronounce-btn"
                      onClick={() => speakWord(mq.word.en)}
                      title="Telaffuzu Dinle"
                    >
                      🔊
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- ACTIVE QUIZ SCREEN ---
  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const levelInfo = levels.find((l) => l.id === q.word.level);
  const isTrQuestion = q.direction === 'tr-to-en';
  const displayWord = isTrQuestion ? q.word.tr : q.word.en;
  const targetPronounceWord = q.word.en;

  const letterLabels = ['A', 'B', 'C'];

  return (
    <div className="quiz-container">
      {/* Progress & Score Bar */}
      <div className="quiz-header">
        <div className="flashcard-progress">
          <span>
            Soru {currentQuestion + 1}/{questions.length}
          </span>
          <div className="flashcard-progress-bar">
            <div className="flashcard-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="quiz-score" style={{ gap: '12px' }}>
          {combo >= 2 && <div className="quiz-combo-badge">🔥 {combo} Seri!</div>}
          <div className="quiz-score-item" style={{ color: 'var(--success)' }}>
            ✅ {score}
          </div>
          <div className="quiz-score-item" style={{ color: 'var(--danger)' }}>
            ❌ {wrongCount}
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      {timerMode !== 'none' && (
        <div className="quiz-timer-wrapper">
          <div className="quiz-timer-header">
            <span>⏱️ Kalan Süre</span>
            <span className={`quiz-timer-seconds ${timeLeft <= 4 ? 'pulse-danger' : ''}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="quiz-timer-track">
            <div
              className="quiz-timer-fill"
              style={{
                width: `${(timeLeft / maxTimer) * 100}%`,
                backgroundColor:
                  timeLeft > maxTimer * 0.5
                    ? '#10b981'
                    : timeLeft > maxTimer * 0.25
                    ? '#f59e0b'
                    : '#ef4444',
              }}
            />
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="quiz-question-card">
        <div className="quiz-emoji">{q.word.emoji}</div>
        <div className="quiz-question-text">
          {isTrQuestion
            ? 'Bu Türkçe kelimenin İngilizce karşılığı nedir?'
            : 'Bu İngilizce kelimenin Türkçe karşılığı nedir?'}
        </div>

        <div className="quiz-word-wrapper">
          <div className="quiz-word">{displayWord}</div>
          <button
            type="button"
            className="audio-pronounce-btn"
            onClick={() => speakWord(targetPronounceWord)}
            title="İngilizce Telaffuzu Dinle"
            aria-label="Telaffuz"
          >
            🔊
          </button>
        </div>

        <div className="quiz-example">"{q.word.example}"</div>

        <span
          className="word-card-level"
          style={{
            background: `${levelInfo?.color}22`,
            color: levelInfo?.color,
            display: 'inline-block',
            marginTop: '10px',
          }}
        >
          {levelInfo?.icon} {q.word.level}
        </span>

        {/* Answer Feedback Alert */}
        {showResult && (
          <div className={`quiz-feedback-box ${selectedOption === q.correctAnswer ? 'correct' : 'wrong'}`}>
            {isTimedOut ? (
              <span>⏰ Süre Doldu! Doğru cevap: <strong>{q.correctAnswer}</strong></span>
            ) : selectedOption === q.correctAnswer ? (
              <span>🎉 Harika! Doğru cevap: <strong>{q.correctAnswer}</strong></span>
            ) : (
              <span>❌ Yanlış! Doğru cevap: <strong>{q.correctAnswer}</strong></span>
            )}
          </div>
        )}
      </div>

      {/* 3 Options */}
      <div className="quiz-options">
        {q.options.map((option, index) => {
          let className = 'quiz-option';
          if (showResult) {
            if (option === q.correctAnswer) {
              className += ' correct';
            } else if (option === selectedOption) {
              className += ' wrong';
            }
          }

          return (
            <button
              key={index}
              className={className}
              onClick={() => handleAnswer(option)}
              disabled={selectedOption !== null || showResult}
              id={`quiz-option-${index}`}
            >
              <span className="quiz-option-letter">{letterLabels[index] || index + 1}</span>
              <span className="quiz-option-text">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
