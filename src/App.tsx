import { useState, useEffect } from 'react';
import { useAppState, AVATARS, type UserProfile } from './hooks/useAppState';
import { MathVisualizer } from './components/MathVisualizer';
import { Confetti } from './components/Confetti';
import { CurriculumSandbox } from './components/CurriculumSandbox';
import './App.css';

export const TOPICS = [
  { id: 'numbers', en: 'Numbers & Counting', ms: 'Nombor & Pengiraan', icon: '🔢' },
  { id: 'missing-numbers', en: 'Missing Numbers', ms: 'Nombor Terlepas', icon: '❓' },
  { id: 'addition-subtraction', en: 'Addition & Subtraction', ms: 'Tambah & Tolak', icon: '➕' },
  { id: 'multiplication-division', en: 'Multiplication & Division', ms: 'Darab & Bahagi', icon: '✖️' },
  { id: 'fractions', en: 'Fractions', ms: 'Pecahan', icon: '🍰' },
  { id: 'money-shopping', en: 'Money & Shopping', ms: 'Wang & Membeli-belah', icon: '💰' },
  { id: 'telling-time', en: 'Telling Time', ms: 'Membaca Masa', icon: '⏰' },
  { id: 'measurement-units', en: 'Measurement & Units', ms: 'Ukuran & Unit', icon: '⚖️' },
  { id: 'shapes-geometry', en: 'Shapes & Geometry', ms: 'Bentuk & Geometri', icon: '📐' },
  { id: 'data-graphs', en: 'Data & Graphs', ms: 'Data & Graf', icon: '📈' },
];

export const FOLDERS = [
  {
    id: 'basics',
    en: 'The Absolute Basics',
    ms: 'Asas Mutlak',
    icon: '🏫',
    topics: ['numbers', 'missing-numbers', 'addition-subtraction', 'multiplication-division']
  },
  {
    id: 'fractions',
    en: 'Fractions',
    ms: 'Pecahan',
    icon: '🍰',
    topics: ['fractions']
  },
  {
    id: 'daily',
    en: 'Daily Life Math',
    ms: 'Matematik Harian',
    icon: '💰',
    topics: ['telling-time', 'money-shopping', 'measurement-units']
  },
  {
    id: 'geometry',
    en: 'Shapes, Geometry & Data',
    ms: 'Ruang & Statistik',
    icon: '📐',
    topics: ['shapes-geometry', 'data-graphs']
  }
];

export default function App() {
  const {
    currentView,
    setCurrentView,
    users,
    activeUser,
    settings,
    updateSettings,
    createProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    resetAllData,
    
    // Practice state
    activeTopic,
    activeYear,
    currentQuestion,
    questionIndex,
    testScore,
    totalTestQuestions,
    attempts,
    isQuestionCorrect,
    completedTest,
    submitAnswer,
    nextQuestion,
    startTest
  } = useAppState();

  // Local state for forms
  const [editingName, setEditingName] = useState('');
  const [editingAge, setEditingAge] = useState(7);
  const [editingAvatar, setEditingAvatar] = useState(AVATARS[0].id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('numbers');
  const [expandedFolder, setExpandedFolder] = useState<string>('basics');
  const [selectedYear, setSelectedYear] = useState<string>('Y1');

  // Auto-select year based on child profile's age on login
  useEffect(() => {
    if (activeUser) {
      const mappedYear = `Y${Math.max(1, Math.min(6, activeUser.age - 6))}`;
      setSelectedYear(mappedYear);
    }
  }, [activeUser?.id]);

  // Trigger registration view if no users exist
  const isFreshInstall = users.length === 0;

  // Track if option shakes on wrong answers
  const [shakeOption, setShakeOption] = useState<string | null>(null);

  // Tab state for mobile dashboard layout
  const [dashboardTab, setDashboardTab] = useState<'play' | 'stats'>('play');

  // Auto transition & Wrong answers states
  const [isAutoTransitioning, setIsAutoTransitioning] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);

  // Effect to lock scrolling ONLY in practice mode
  useEffect(() => {
    if (currentView === 'practice' && !completedTest) {
      document.body.classList.add('practice-active');
    } else {
      document.body.classList.remove('practice-active');
    }
    return () => document.body.classList.remove('practice-active');
  }, [currentView, completedTest]);

  // Effect to reset wrong answers when a new question loads
  useEffect(() => {
    setWrongAnswers([]);
  }, [currentQuestion?.id]);

  // Initialize edit form when settings page is loaded
  const handleEditInit = (user: UserProfile) => {
    setEditingName(user.name);
    setEditingAge(user.age);
    setEditingAvatar(user.avatar);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProfile(editingName, editingAge, editingAvatar);
    setEditingName('');
    setEditingAge(7);
    setEditingAvatar(AVATARS[0].id);
    setShowAddForm(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUser) {
      updateProfile(activeUser.id, editingName, editingAge, editingAvatar);
      setCurrentView('dashboard');
    }
  };

  const handleOptionClick = (option: string) => {
    if (isQuestionCorrect === true || isAutoTransitioning) return;
    
    const isCorrect = option === currentQuestion?.correctAnswer;
    submitAnswer(option);
    
    if (isCorrect) {
      setIsAutoTransitioning(true);
      setTimeout(() => {
        nextQuestion();
        setIsAutoTransitioning(false);
      }, 1500);
    } else {
      setWrongAnswers((prev) => [...prev, option]);
      setShakeOption(option);
      setTimeout(() => setShakeOption(null), 500);
    }
  };

  const getTopicTranslation = (topicId: string, lang: 'en' | 'ms'): string => {
    const topic = TOPICS.find((t) => t.id === topicId.toLowerCase());
    if (!topic) return topicId;
    return lang === 'ms' ? `${topic.icon} ${topic.ms}` : `${topic.icon} ${topic.en}`;
  };

  const getMascotSpeech = (): { en: string; ms: string } => {
    if (isQuestionCorrect === null) {
      return {
        en: "Let's read the question together and pick the correct answer below!",
        ms: "Mari baca soalan bersama-sama dan pilih jawapan yang betul di bawah!"
      };
    }
    if (isQuestionCorrect === true) {
      if (attempts === 1) {
        return {
          en: "Wow! Correct on the very first try! You are a superstar! 🌟",
          ms: "Wah! Betul pada cubaan pertama! Anda seorang bintang! 🌟"
        };
      }
      return {
        en: "Great job! You figured it out! Keep going! 🎉",
        ms: "Syabas! Anda berjaya menyelesaikannya! Teruskan! 🎉"
      };
    }
    
    // Socratic hints based on question topic
    const sub = currentQuestion?.subtopic || '';
    if (sub.includes('Counting')) {
      return {
        en: "Let's point and count each item slowly one by one. Try counting again!",
        ms: "Mari tunjuk dan kira setiap satu dengan perlahan. Cuba kira sekali lagi!"
      };
    }
    if (sub.includes('Fraction')) {
      return {
        en: "Count how many parts are shaded in purple, then count the total parts!",
        ms: "Kira berapa bahagian berwarna ungu, kemudian kira jumlah semua bahagian!"
      };
    }
    if (sub.includes('Clock')) {
      return {
        en: "Look at the short hand for the hour, and the long red hand for the minutes!",
        ms: "Lihat jarum pendek untuk jam, dan jarum panjang merah untuk minit!"
      };
    }
    if (sub.includes('Shape')) {
      return {
        en: "Count the straight outer lines or the sharp corners of the shape!",
        ms: "Kira garisan luar yang lurus atau bucu-bucu tajam pada bentuk tersebut!"
      };
    }
    if (sub.includes('Pattern')) {
      return {
        en: "Find out if the numbers are going up or down, and by how much!",
        ms: "Cari tahu sama ada nombor semakin menaik atau menurun, dan berapa bezanya!"
      };
    }
    return {
      en: "Don't worry! Read the question again, or look closely at the visual drawing. You can do it!",
      ms: "Jangan risau! Baca soalan semula, atau perhatikan lukisan dengan teliti. Anda boleh!"
    };
  };

  // Render Views
  
  // 1. Fresh Install Welcome Screen
  if (isFreshInstall) {
    return (
      <div className="app-main flex items-center justify-center">
        <div className="chunky-card max-w-md w-full text-center">
          <h1 className="text-primary mb-2">👋 Welcome!</h1>
          <p className="mb-6 font-medium text-slate-600">
            Let's create the first player account. Siblings can add up to 4 accounts later!
          </p>
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block font-bold mb-1">Name / Nama:</label>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Enter player name"
                required
                className="w-full p-3 border-3 border-slate-800 rounded-xl font-fun text-lg focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Age / Umur: ({editingAge} years)</label>
              <input
                type="range"
                min="5"
                max="12"
                value={editingAge}
                onChange={(e) => setEditingAge(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-sm text-slate-500 font-bold">
                <span>5 yrs</span>
                <span>8 yrs</span>
                <span>12 yrs</span>
              </div>
            </div>
            <div>
              <label className="block font-bold mb-4">Choose Avatar / Pilih Avatar:</label>
              <div className="flex justify-around gap-2 flex-wrap mt-3">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setEditingAvatar(av.id)}
                    className={`avatar-badge text-4xl ${editingAvatar === av.id ? 'active' : ''}`}
                    style={{ backgroundColor: av.color }}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="chunky-btn chunky-btn-primary w-full mt-4">
              Let's Play! ➔
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Profile Selection Screen (Active User is null)
  if (!activeUser) {
    return (
      <div className="app-main flex flex-col items-center justify-center gap-6">
        <div className="chunky-card welcome-card max-w-2xl w-full text-center">
          <h1 className="mb-8">🏫 Who is playing? / Siapa bermain?</h1>
          
          {!showAddForm ? (
            <>
              <div className="user-grid mb-8">
                {users.map((u) => {
                  const av = AVATARS.find((a) => a.id === u.avatar);
                  return (
                    <div
                      key={u.id}
                      onClick={() => selectProfile(u.id)}
                      className="user-card chunky-card hover:scale-105 transition-transform"
                    >
                      <div className="avatar-badge text-4xl" style={{ backgroundColor: av?.color || '#e2e8f0' }}>
                        {av?.emoji}
                      </div>
                      <div className="user-card-name text-slate-800">{u.name}</div>
                      <div className="text-sm font-bold text-slate-500">Age: {u.age}</div>
                      <div className="text-sm font-bold text-purple-600">⭐ {u.stars}</div>
                    </div>
                  );
                })}
                
                {users.length < 4 && (
                  <div
                    onClick={() => setShowAddForm(true)}
                    className="user-card chunky-card border-dashed hover:scale-105 transition-transform flex items-center justify-center bg-slate-50/50"
                  >
                    <div className="avatar-badge text-3xl bg-slate-200 flex items-center justify-center font-bold">
                      +
                    </div>
                    <div className="user-card-name text-slate-400">Add Sibling</div>
                    <div className="text-xs font-bold text-slate-400">Tambah Ahli</div>
                  </div>
                )}
              </div>
              <div className="reset-btn-container">
                <button onClick={resetAllData} className="chunky-btn chunky-btn-danger">
                  🗑️ Reset All App Data
                </button>
              </div>
            </>
          ) : (
            <div className="text-left max-w-md mx-auto">
              <h3 className="text-center font-fun text-xl mb-4">Add a New Player / Tambah Sibling</h3>
              <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block font-bold mb-1">Name:</label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Player name"
                    required
                    className="w-full p-2.5 border-3 border-slate-800 rounded-xl font-fun focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Age: ({editingAge} years)</label>
                  <input
                    type="range"
                    min="5"
                    max="12"
                    value={editingAge}
                    onChange={(e) => setEditingAge(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-4">Avatar:</label>
                  <div className="flex justify-around gap-2 flex-wrap mt-3">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditingAvatar(av.id)}
                        className={`avatar-badge text-3xl ${editingAvatar === av.id ? 'active' : ''}`}
                        style={{ backgroundColor: av.color, width: '60px', height: '60px' }}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 mt-2">
                  <button type="button" onClick={() => setShowAddForm(false)} className="chunky-btn chunky-btn-light flex-1">
                    Back
                  </button>
                  <button type="submit" className="chunky-btn chunky-btn-primary flex-1">
                    Add Sibling
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  const activeAvatar = AVATARS.find((av) => av.id === activeUser.avatar);
  const todayStr = new Date().toISOString().split('T')[0];
  const questionsDoneToday = activeUser.dailyScores[todayStr] || 0;
  const displayName = activeUser.name.length > 8 ? activeUser.name.substring(0, 8) + '...' : activeUser.name;

  return (
    <>
      <Confetti active={completedTest && testScore >= 8} />

      {/* --- HUD HEADER BAR --- */}
      {currentView !== 'practice' && (
        <header className="app-header">
          <div className="flex items-center gap-3">
            <div
              className="avatar-badge text-3xl w-12 h-12 bg-white"
              style={{ backgroundColor: activeAvatar?.color, cursor: 'pointer' }}
              onClick={() => selectProfile(null)}
              title="Switch Player"
            >
              {activeAvatar?.emoji}
            </div>
            <span className="font-fun font-bold text-lg text-slate-800 text-truncate" title={activeUser.name}>{displayName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => selectProfile(null)}
              className="header-control"
            >
              👥 Switch Player
            </button>
            {(window.location.hostname === 'localhost' || window.location.search.includes('sandbox=true')) && (
              <button
                onClick={() => setCurrentView('sandbox')}
                className="header-control"
              >
                🛠️ Sandbox
              </button>
            )}
            <button
              onClick={() => {
                handleEditInit(activeUser);
                setCurrentView('settings');
              }}
              className="header-control"
              style={{ width: '44px', padding: 0, fontSize: '1.4rem' }}
              title="Settings"
            >
              ⚙️
            </button>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as any })}
              className="header-control"
              style={{ padding: '0 12px', minWidth: '64px', textAlign: 'center' }}
            >
              <option value="en">EN</option>
              <option value="ms">MY</option>
            </select>
          </div>
        </header>
      )}

      {/* --- MAIN PAGE VIEWS --- */}
      <main className="app-main">
        {/* --- VIEW 1: DASHBOARD --- */}
        {currentView === 'dashboard' && (
          <div className="flex flex-col w-full">
            {/* Dashboard Mobile Tabs */}
            <div className="dashboard-tabs">
              <button
                type="button"
                onClick={() => setDashboardTab('play')}
                className={`dashboard-tab-btn ${dashboardTab === 'play' ? 'active' : ''}`}
              >
                🎮 {settings.language === 'ms' ? 'Latihan' : 'Play'}
              </button>
              <button
                type="button"
                onClick={() => setDashboardTab('stats')}
                className={`dashboard-tab-btn ${dashboardTab === 'stats' ? 'active' : ''}`}
              >
                📈 {settings.language === 'ms' ? 'Rekod' : 'Stats'}
              </button>
            </div>

            <div className="dashboard-grid">
              {/* Left Side: Stats and History */}
              <div className={`chunky-card flex flex-col gap-6 ${dashboardTab === 'stats' ? '' : 'mobile-hide'}`}>
                <h2 className="text-primary">📈 {settings.language === 'ms' ? 'Rekod Kemajuan' : 'Progress Board'}</h2>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl border-2 border-purple-200">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <div className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                      {settings.language === 'ms' ? 'Jumlah Bintang Terkumpul' : 'Total Stars Earned'}
                    </div>
                    <div className="font-fun text-xl text-purple-600">
                      {activeUser.stars} {settings.language === 'ms' ? 'bintang' : 'stars'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                      {settings.language === 'ms' ? 'Soalan Selesai Hari Ini' : "Today's Questions"}
                    </div>
                    <div className="font-fun text-xl text-emerald-600">
                      {questionsDoneToday} {settings.language === 'ms' ? 'soalan' : 'questions'}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-fun text-xl mb-3 text-slate-700">
                    {settings.language === 'ms' ? 'Rekod Latihan (10 Terakhir)' : 'Recent Games (Last 10)'}
                  </h3>
                  {activeUser.recentGames.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center text-slate-400 font-bold">
                      {settings.language === 'ms' ? 'Belum ada rekod. Sila main di sebelah untuk mula!' : 'No games played yet. Play a game below to see your history!'}
                    </div>
                  ) : (
                    <div className="recent-games-scroll flex flex-col gap-2 pr-1">
                      {activeUser.recentGames.map((game) => {
                        const isGood = game.score >= 8;
                        const isOk = game.score >= 5;
                        return (
                          <div
                            key={game.id}
                            className="flex justify-between items-center p-3 border-2 border-slate-800 rounded-xl text-sm"
                            style={{
                              backgroundColor: isGood ? '#ecfdf5' : (isOk ? '#fffbeb' : '#fef2f2'),
                            }}
                          >
                            <div>
                              <div className="font-bold text-slate-700">
                                {getTopicTranslation(game.topic, settings.language)}
                              </div>
                              <div className="text-xs text-slate-500 capitalize">
                                {settings.language === 'ms' ? `Tahun ${game.year?.substring(1)}` : `Year ${game.year?.substring(1)}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-fun text-base font-bold text-slate-800">
                                {game.score} / {game.totalQuestions}
                              </span>
                              <div className="text-xs text-slate-400">
                                {new Date(game.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Play Card */}
              <div className={`chunky-card flex flex-col justify-between gap-6 border-purple-600 bg-purple-50/20 ${dashboardTab === 'play' ? '' : 'mobile-hide'}`}>
              <div>
                <h2 className="text-center text-primary mb-6">🚀 {settings.language === 'ms' ? 'Mula Latihan Matematik' : 'Start Math Exercise'}</h2>
                
                {/* Year selection */}
                <div className="mb-6">
                  <label className="block font-bold mb-3">
                    {settings.language === 'ms' ? '1. Pilih Tahun Pendidikan:' : '1. Choose School Year:'}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'].map((year) => {
                      const isActive = selectedYear === year;
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setSelectedYear(year)}
                          className={`chunky-btn ${isActive ? 'chunky-btn-primary' : 'chunky-btn-light'}`}
                          style={{ minHeight: '44px', padding: '8px', fontSize: '13px' }}
                        >
                          {settings.language === 'ms' ? `Thn ${year.substring(1)}` : `Year ${year.substring(1)}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'].includes(selectedYear) ? (
                  <>
                    {/* Topic selection */}
                    <div className="mb-4">
                      <label className="block font-bold mb-3">
                        {settings.language === 'ms' ? '2. Pilih Kategori & Topik:' : '2. Choose Category & Topic:'}
                      </label>
                      
                      <div className="flex flex-col gap-3">
                        {FOLDERS.map((folder, folderIdx) => {
                          const isExpanded = expandedFolder === folder.id;
                          const hasActiveTopic = folder.topics.includes(selectedTopic);
                          const folderName = settings.language === 'ms' ? folder.ms : folder.en;
                          return (
                            <div key={folder.id} className="folder-container">
                              {/* Folder Header */}
                              <button
                                type="button"
                                onClick={() => setExpandedFolder(isExpanded ? '' : folder.id)}
                                className={`folder-header-btn w-full ${isExpanded ? 'active' : ''} ${
                                  hasActiveTopic && !isExpanded ? 'folder-header-has-active' : ''
                                }`}
                              >
                                <span className="flex items-center gap-3">
                                  <span className="text-xl">{folder.icon}</span>
                                  <span className="font-bold text-left text-slate-800 folder-header-title">
                                    {folderIdx + 1}. {folderName}
                                  </span>
                                </span>
                                <span className="folder-arrow-indicator font-bold text-slate-600">
                                  {isExpanded ? '▼' : '►'}
                                </span>
                              </button>

                              {/* Subtopics Grid (when expanded) */}
                              {isExpanded && (
                                <div className="topics-grid-container mt-3 p-3 bg-slate-50/70 rounded-2xl border-2 border-slate-200">
                                  {TOPICS.filter((t) => folder.topics.includes(t.id)).map((topic) => (
                                    <button
                                      key={topic.id}
                                      onClick={() => setSelectedTopic(topic.id)}
                                      className={`chunky-btn topic-tile-btn ${selectedTopic === topic.id ? 'chunky-btn-primary' : 'chunky-btn-light'}`}
                                    >
                                      <span style={{ fontSize: '1.4rem' }}>{topic.icon}</span>
                                      <span className="font-medium topic-tile-label">
                                        {settings.language === 'ms' ? topic.ms : topic.en}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => startTest(selectedTopic, selectedYear)}
                      className="chunky-btn chunky-btn-success w-full text-xl mt-4"
                    >
                      🎮 {settings.language === 'ms' ? 'MULA SEKARANG!' : 'PLAY NOW!'}
                    </button>
                  </>
                ) : (
                  <div className="p-8 text-center bg-white border-4 border-slate-800 rounded-3xl shadow-chunky mt-4">
                    <span className="text-5xl block mb-4">🚀</span>
                    <h3 className="font-fun text-xl text-slate-800 mb-2">
                      {settings.language === 'ms' 
                        ? `Tahun ${selectedYear.substring(1)} Akan Datang!` 
                        : `Year ${selectedYear.substring(1)} Curriculum Coming Soon!`}
                    </h3>
                    <p className="text-slate-600 text-sm font-medium mb-4 max-w-sm mx-auto leading-relaxed">
                      {settings.language === 'ms'
                        ? `Kami sedang menyediakan silabus interaktif bertaraf antarabangsa untuk Tahun ${selectedYear.substring(1)}.`
                        : `We are currently designing and validating the interactive syllabus for Year ${selectedYear.substring(1)}.`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedYear('Y1')}
                      className="chunky-btn chunky-btn-primary text-xs"
                    >
                      {settings.language === 'ms' ? 'Kembali ke Tahun 1' : 'Back to Year 1'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* --- VIEW 2: SETTINGS --- */}
        {currentView === 'settings' && (
          <div className="chunky-card max-w-xl mx-auto w-full settings-container">
            <div className="flex justify-between items-center mb-6">
              <h2>⚙️ Settings / Tetapan</h2>
              <button onClick={() => setCurrentView('dashboard')} className="chunky-btn chunky-btn-light">
                Close
              </button>
            </div>

            {/* Edit form */}
            <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4 text-left mb-8 border-b-2 border-slate-200 pb-8">
              <h3 className="font-fun text-slate-700">Edit Active Profile</h3>
              <div>
                <label className="block font-bold mb-1">Name:</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Player name"
                  required
                  className="w-full p-2.5 border-3 border-slate-800 rounded-xl font-fun focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Age: ({editingAge} years)</label>
                <input
                  type="range"
                  min="5"
                  max="12"
                  value={editingAge}
                  onChange={(e) => setEditingAge(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
              <div>
                <label className="block font-bold mb-4">Avatar:</label>
                <div className="flex justify-around gap-2 flex-wrap mt-3">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setEditingAvatar(av.id)}
                      className={`avatar-badge text-3xl ${editingAvatar === av.id ? 'active' : ''}`}
                      style={{ backgroundColor: av.color, width: '60px', height: '60px' }}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="chunky-btn chunky-btn-primary w-full mt-2">
                Save Profile Changes
              </button>
            </form>

            {/* General Preferences */}
            <div className="text-left mb-8 border-b-2 border-slate-200 pb-8">
              <h3 className="font-fun text-slate-700">Audio Preferences</h3>
              <div className="flex justify-between items-center p-3 border-2 border-slate-800 rounded-xl bg-slate-50">
                <span className="font-bold">Play sound effects on answer:</span>
                <button
                  type="button"
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`chunky-btn ${settings.soundEnabled ? 'chunky-btn-success' : 'chunky-btn-danger'}`}
                  style={{ minHeight: '44px' }}
                >
                  {settings.soundEnabled ? 'Sound ON' : 'Sound OFF'}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="text-left">
              <h3 className="font-fun text-red-600">Danger Zone / Zon Bahaya</h3>
              <p className="text-xs text-slate-500 mb-4">
                Be careful! These options permanently delete your recorded data.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this profile? All stars and history will be lost!')) {
                      deleteProfile(activeUser.id);
                    }
                  }}
                  className="chunky-btn chunky-btn-danger"
                >
                  🗑️ Delete This Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('WIPE ALL DATA? This resets all 4 slots and history records.')) {
                      resetAllData();
                    }
                  }}
                  className="chunky-btn chunky-btn-danger"
                >
                  💣 Wipe All App Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2.5: SANDBOX --- */}
        {currentView === 'sandbox' && (
          <div className="flex flex-col gap-4 w-full">
            <div className="hud-bar">
              <button onClick={() => setCurrentView('dashboard')} className="chunky-btn chunky-btn-light" style={{ minHeight: '44px' }}>
                ◀ Back
              </button>
              <div className="hud-item text-slate-800 font-bold">
                🛠️ Curriculum Sandbox
              </div>
            </div>
            <CurriculumSandbox />
          </div>
        )}

        {/* --- VIEW 3: PRACTICE ARENA --- */}
        {currentView === 'practice' && (
          <div className="flex flex-col gap-4 w-full">
            {/* Arena HUD */}
            <div className="hud-bar">
              <button onClick={() => setCurrentView('dashboard')} className="chunky-btn chunky-btn-light" style={{ minHeight: '44px' }}>
                ◀ Back
              </button>
              <div className="hud-item text-slate-800">
                🎯 {getTopicTranslation(activeTopic || '', settings.language)}
                <span className="text-sm px-2 py-1 bg-amber-100 border border-amber-300 rounded font-bold capitalize ml-2">
                  {settings.language === 'ms' ? `Tahun ${activeYear.substring(1)}` : `Year ${activeYear.substring(1)}`}
                </span>
              </div>
              <div className="hud-item text-purple-600">
                ⭐ {testScore} pts
              </div>
              <div className="hud-item text-slate-600">
                Question {questionIndex + 1} / {totalTestQuestions}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div
                className="progress-fill"
                style={{ width: `${((questionIndex) / totalTestQuestions) * 100}%` }}
              />
            </div>

            {/* Complete Screen overlay inside practice */}
            {completedTest ? (
              <div className="chunky-card max-w-md mx-auto w-full text-center py-8">
                <h1 className="text-success mb-2">🎉 Completed! / Selesai!</h1>
                <p className="font-bold text-lg text-slate-600 mb-6">
                  Awesome job, {activeUser.name}! Here is your score:
                </p>
                <div className="inline-block p-6 border-4 border-slate-800 rounded-3xl bg-amber-50 mb-6">
                  <div className="font-fun text-5xl text-amber-500 font-bold mb-1">
                    {testScore} / {totalTestQuestions}
                  </div>
                  <div className="font-bold text-slate-500">Correct Answers</div>
                </div>

                <div className="mb-8 font-bold text-purple-600">
                  {testScore >= 8 ? (
                    <div>🌟 Superstar! Perfect score badge!</div>
                  ) : (
                    <div>Good attempt! Keep practicing! 🌟</div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setCurrentView('dashboard')} className="chunky-btn chunky-btn-light flex-1">
                    Dashboard
                  </button>
                  <button
                    onClick={() => startTest(activeTopic || 'numbers', activeYear)}
                    className="chunky-btn chunky-btn-primary flex-1"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            ) : (
              // Active Practice Grid
              <div className="practice-grid">
                {/* Question and SVG Workspace (aligned to start with locked vertical positions) */}
                <div className="chunky-card flex flex-col justify-start items-center text-center gap-6 p-6">
                  {/* Bilingual Display in fixed-height container */}
                  <div className="practice-question-text-container font-fun text-xl md:text-2xl font-bold px-2 flex flex-col justify-center items-center gap-1.5 w-full">
                    {settings.language !== 'ms' && currentQuestion?.questionEn && (
                      <div className="bilingual-en w-full">{currentQuestion.questionEn}</div>
                    )}
                    {settings.language !== 'en' && currentQuestion?.questionMs && (
                      <div className="bilingual-ms w-full">{currentQuestion.questionMs}</div>
                    )}
                  </div>

                  {/* SVG Drawing workspace in fixed-height container (rendered only when drawing exists) */}
                  {currentQuestion && currentQuestion.visualType && currentQuestion.visualType !== 'none' && (
                    <div className="practice-visualizer-container">
                      <MathVisualizer
                        visualType={currentQuestion.visualType}
                        visualData={currentQuestion.visualData}
                      />
                    </div>
                  )}

                  {/* Answer Selection options */}
                  <div className="options-grid w-full max-w-md">
                    {currentQuestion?.options.map((opt, idx) => {
                      const isCorrectChoice = opt === currentQuestion.correctAnswer;
                      const isWrongChoice = wrongAnswers.includes(opt);
                      
                      let btnColorClass = 'chunky-btn-light';
                      if (isQuestionCorrect === true && isCorrectChoice) {
                        btnColorClass = 'chunky-btn-success animate-bounce-slow';
                      } else if (isWrongChoice) {
                        btnColorClass = 'chunky-btn-danger';
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isQuestionCorrect === true || isWrongChoice || isAutoTransitioning}
                          onClick={() => handleOptionClick(opt)}
                          className={`chunky-btn ${btnColorClass} ${shakeOption === opt ? 'shake' : ''} text-lg md:text-xl py-4`}
                        >
                          {opt.includes(' / ') ? (settings.language === 'ms' ? opt.split(' / ')[1] : opt.split(' / ')[0]) : opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Step auto-advance loader */}
                  {isQuestionCorrect === true && (
                    <div className="text-success font-bold text-lg animate-pulse mt-4">
                      🎉 {settings.language === 'ms' ? 'Betul! Membuka soalan seterusnya...' : 'Correct! Loading next question...'}
                    </div>
                  )}
                </div>

                {/* Socratic Mascot Panel */}
                <div className="flex flex-col gap-4">
                  <div className="mascot-container">
                    <div className="mascot-avatar">{activeAvatar?.emoji}</div>
                    <div className="mascot-bubble">
                      <div className="font-bold text-purple-600 mb-1 font-fun">
                        {activeAvatar?.name} says:
                      </div>
                      <div className="font-bold text-slate-700">
                        {settings.language !== 'ms' && (
                          <div className="text-sm font-medium mb-1">{getMascotSpeech().en}</div>
                        )}
                        {settings.language !== 'en' && (
                          <div className="text-sm font-medium italic text-blue-700">{getMascotSpeech().ms}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Socratic Empathy Message */}
                  {!isQuestionCorrect && attempts > 0 && (
                    <div className="chunky-card border-dashed border-amber-400 bg-amber-50/50 p-4 rounded-2xl text-center text-sm font-bold text-amber-700">
                      💡 Don't worry! Try another answer. There is no penalty for taking your time and learning!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
