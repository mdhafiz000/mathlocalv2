import { useState, useEffect } from 'react';
import { generateQuestion, type MathQuestion } from '../utils/mathEngine';

export interface GameRecord {
  id: string;
  timestamp: string;
  topic: string;
  year: string;
  score: number;
  totalQuestions: number;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  avatar: string; // 'lion' | 'koala' | 'panda' | 'rabbit' | 'monkey' | 'fox'
  stars: number; // Cumulative correct questions answered
  dailyScores: { [dateStr: string]: number }; // Date (YYYY-MM-DD) -> Questions answered today
  recentGames: GameRecord[]; // Capped at 10 items
}

export interface AppSettings {
  language: 'en' | 'ms';
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  soundEnabled: true,
};

const LOCAL_STORAGE_KEY = 'aimath_local_state';

// Available avatars
export const AVATARS = [
  { id: 'lion', emoji: '🦁', color: '#FCD34D', name: 'Leo' },
  { id: 'koala', emoji: '🐨', color: '#9CA3AF', name: 'Koko' },
  { id: 'panda', emoji: '🐼', color: '#D1D5DB', name: 'Pip' },
  { id: 'rabbit', emoji: '🐰', color: '#FCA5A5', name: 'Bunny' },
  { id: 'monkey', emoji: '🐵', color: '#FDBA74', name: 'Momo' },
  { id: 'fox', emoji: '🦊', color: '#F97316', name: 'Foxy' },
];

export function useAppState() {
  // App-wide state
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'practice' | 'sandbox'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Active Practice state
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<string>('Y1');
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [testScore, setTestScore] = useState<number>(0);
  const [totalTestQuestions] = useState<number>(10); // Standard length
  const [attempts, setAttempts] = useState<number>(0);
  const [isQuestionCorrect, setIsQuestionCorrect] = useState<boolean | null>(null); // null = unanswered, false = incorrect guess, true = correct
  const [completedTest, setCompletedTest] = useState<boolean>(false);
  const [usedQuestionTexts, setUsedQuestionTexts] = useState<string[]>([]);

  // Load state from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.activeUserId) setActiveUserId(parsed.activeUserId);
        if (parsed.settings) {
          const loaded = parsed.settings;
          if (loaded.language === 'dual' || !loaded.language) {
            loaded.language = 'en';
          }
          setSettings(loaded);
        }
      }
    } catch (e) {
      console.error('Failed to load app state from localStorage:', e);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToStore = {
        users,
        activeUserId,
        settings,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToStore));
    } catch (e) {
      console.error('Failed to save app state to localStorage:', e);
    }
  }, [users, activeUserId, settings]);

  // Reset test state when leaving practice view to stop confetti
  useEffect(() => {
    if (currentView !== 'practice') {
      setCompletedTest(false);
      setIsQuestionCorrect(null);
      setActiveTopic(null);
    }
  }, [currentView]);

  const activeUser = users.find((u) => u.id === activeUserId) || null;

  // --- Profile Actions ---
  const createProfile = (name: string, age: number, avatar: string) => {
    if (users.length >= 4) return;
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim() || `Player ${users.length + 1}`,
      age: Math.max(5, Math.min(12, age)),
      avatar,
      stars: 0,
      dailyScores: {},
      recentGames: [],
    };
    setUsers([...users, newUser]);
    setActiveUserId(newUser.id);
  };

  const updateProfile = (id: string, name: string, age: number, avatar: string) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? {
              ...u,
              name: name.trim() || u.name,
              age: Math.max(5, Math.min(12, age)),
              avatar,
            }
          : u
      )
    );
  };

  const deleteProfile = (id: string) => {
    const remaining = users.filter((u) => u.id !== id);
    setUsers(remaining);
    if (activeUserId === id) {
      setActiveUserId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const selectProfile = (id: string | null) => {
    setActiveUserId(id);
    setCurrentView('dashboard');
  };

  // --- Setting Actions ---
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUsers([]);
    setActiveUserId(null);
    setSettings(DEFAULT_SETTINGS);
    setCurrentView('dashboard');
  };

  // --- Practice/Test Actions ---
  const startTest = (topic: string, year: string) => {
    if (!activeUser) return;
    setActiveTopic(topic);
    setActiveYear(year);
    setQuestionIndex(0);
    setTestScore(0);
    setAttempts(0);
    setIsQuestionCorrect(null);
    setCompletedTest(false);

    // Generate first question
    const q = generateQuestion(year, topic);
    setUsedQuestionTexts([q.questionEn]);
    setCurrentQuestion(q);
    setCurrentView('practice');
  };

  const submitAnswer = (selectedAnswer: string) => {
    if (!currentQuestion || isQuestionCorrect === true) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setAttempts((prev) => prev + 1);

    if (isCorrect) {
      setIsQuestionCorrect(true);
      // Play correct sound
      if (settings.soundEnabled) {
        playAudio(true);
      }
      
      // If first attempt is correct, reward full score point for this question
      const isFirstAttemptCorrect = attempts === 0;
      if (isFirstAttemptCorrect) {
        setTestScore((prev) => prev + 1);
      }

      // Update active user daily questions count and stars in local array
      const todayStr = new Date().toISOString().split('T')[0];
      setUsers(
        users.map((u) => {
          if (u.id === activeUserId) {
            const currentDaily = u.dailyScores[todayStr] || 0;
            return {
              ...u,
              stars: u.stars + (isFirstAttemptCorrect ? 1 : 0),
              dailyScores: {
                ...u.dailyScores,
                [todayStr]: currentDaily + 1,
              },
            };
          }
          return u;
        })
      );
    } else {
      setIsQuestionCorrect(false);
      // Play wrong sound
      if (settings.soundEnabled) {
        playAudio(false);
      }
    }
  };

  const nextQuestion = () => {
    if (!activeUser || !activeTopic) return;

    if (questionIndex + 1 >= totalTestQuestions) {
      // Test complete
      setCompletedTest(true);
      
      const newRecord: GameRecord = {
        id: `game-${Date.now()}`,
        timestamp: new Date().toISOString(),
        topic: activeTopic,
        year: activeYear,
        score: testScore, // Use the correct accumulated score directly
        totalQuestions: totalTestQuestions,
      };

      setUsers(
        users.map((u) => {
          if (u.id === activeUserId) {
            const updatedRecent = [newRecord, ...u.recentGames].slice(0, 10);
            return {
              ...u,
              recentGames: updatedRecent,
            };
          }
          return u;
        })
      );
    } else {
      // Move to next question
      setQuestionIndex((prev) => prev + 1);
      setAttempts(0);
      setIsQuestionCorrect(null);
      
      let q = generateQuestion(activeYear, activeTopic);
      let dedupeAttempts = 0;
      while (usedQuestionTexts.includes(q.questionEn) && dedupeAttempts < 15) {
        q = generateQuestion(activeYear, activeTopic);
        dedupeAttempts++;
      }
      
      setUsedQuestionTexts((prev) => [...prev, q.questionEn]);
      setCurrentQuestion(q);
    }
  };

  // Helper to synthesize cheerful sound effects locally using Web Audio API
  const playAudio = (isCorrect: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (isCorrect) {
        // High ascending chord (Cheerful sound)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else {
        // Soft sliding down chord / bonk (No punishment, just warm alert)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn('Audio feedback failed to play:', e);
    }
  };

  return {
    currentView,
    setCurrentView,
    users,
    activeUser,
    activeUserId,
    settings,
    updateSettings,
    createProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    resetAllData,
    
    // Practice state
    startTest,
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
  };
}
