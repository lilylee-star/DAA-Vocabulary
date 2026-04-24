import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { decodeVocab } from '@/data/vocab';
import type { VocabItem } from '@/data/vocab';
import type { UserState, DailyPlan, WordProgress } from '@/types';

const VOCAB: VocabItem[] = decodeVocab();
const WORDS_PER_DAY = 10;
const REVIEW_PER_DAY = 5;

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isConsecutiveDay(d1: string, d2: string): boolean {
  const a = new Date(d1);
  const b = new Date(d2);
  const diff = (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
  return Math.abs(diff - 1) < 0.5;
}

const DEFAULT_STATE: UserState = {
  streak: 0,
  longestStreak: 0,
  totalWordsLearned: 0,
  totalCorrect: 0,
  totalWrong: 0,
  startDate: getToday(),
  lastStudyDate: null,
  wordProgress: {},
  dailyPlans: {},
  studyCalendar: {},
};

export function useLearningEngine() {
  const [state, setState] = useLocalStorage<UserState>('vocabMaster_state', DEFAULT_STATE);

  const today = getToday();

  const allWords = useMemo(() => VOCAB.map(v => v.word), []);
  const vocabMap = useMemo(() => {
    const map: Record<string, VocabItem> = {};
    VOCAB.forEach(v => { map[v.word] = v; });
    return map;
  }, []);

  const getOrCreateDailyPlan = useCallback((): DailyPlan => {
    if (state.dailyPlans[today]) {
      return state.dailyPlans[today];
    }

    // Determine which words to learn today
    const learnedWords = Object.keys(state.wordProgress);
    const masteredWords = Object.entries(state.wordProgress)
      .filter(([_, p]) => p.level >= 3)
      .map(([w, _]) => w);
    
    // New words: not yet learned
    const newCandidates = allWords.filter(w => !learnedWords.includes(w));
    const newWords = newCandidates.slice(0, WORDS_PER_DAY);

    // Review words: learned but not mastered, or due for review
    const reviewCandidates = Object.entries(state.wordProgress)
      .filter(([w, p]) => p.level < 3 && !masteredWords.includes(w))
      .sort((a, b) => {
        // Prioritize words with more wrong answers and older review dates
        const aScore = a[1].wrongCount - (a[1].lastReviewed ? 0 : 100);
        const bScore = b[1].wrongCount - (b[1].lastReviewed ? 0 : 100);
        return bScore - aScore;
      })
      .map(([w, _]) => w);
    
    const reviewWords = reviewCandidates.slice(0, REVIEW_PER_DAY);

    const plan: DailyPlan = {
      date: today,
      newWords,
      reviewWords,
      completed: false,
      stats: { correct: 0, wrong: 0, timeSpent: 0 },
    };

    setState(prev => ({
      ...prev,
      dailyPlans: { ...prev.dailyPlans, [today]: plan },
    }));

    return plan;
  }, [state, today, allWords, setState]);

  const recordAnswer = useCallback((word: string, correct: boolean) => {
    setState(prev => {
      const wp = prev.wordProgress[word] || {
        word,
        level: 0,
        correctCount: 0,
        wrongCount: 0,
        lastReviewed: null,
        nextReview: null,
        history: [],
      };

      const newHistory = [...wp.history, correct].slice(-10);
      const newCorrect = wp.correctCount + (correct ? 1 : 0);
      const newWrong = wp.wrongCount + (correct ? 0 : 1);
      
      // Simple spaced repetition leveling
      let newLevel = wp.level;
      if (correct && wp.level < 3) {
        newLevel = wp.level + 1;
      } else if (!correct && wp.level > 0) {
        newLevel = Math.max(0, wp.level - 1);
      }

      const nextReview = new Date();
      if (newLevel === 0) nextReview.setDate(nextReview.getDate() + 1);
      else if (newLevel === 1) nextReview.setDate(nextReview.getDate() + 3);
      else if (newLevel === 2) nextReview.setDate(nextReview.getDate() + 7);
      else nextReview.setDate(nextReview.getDate() + 14);

      const updatedWp: WordProgress = {
        ...wp,
        level: newLevel,
        correctCount: newCorrect,
        wrongCount: newWrong,
        lastReviewed: today,
        nextReview: getDateKey(nextReview),
        history: newHistory,
      };

      const todayPlan = prev.dailyPlans[today];
      const updatedPlan = todayPlan ? {
        ...todayPlan,
        stats: {
          ...todayPlan.stats,
          correct: todayPlan.stats.correct + (correct ? 1 : 0),
          wrong: todayPlan.stats.wrong + (correct ? 0 : 1),
        },
      } : undefined;

      return {
        ...prev,
        wordProgress: { ...prev.wordProgress, [word]: updatedWp },
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        totalWrong: prev.totalWrong + (correct ? 0 : 1),
        dailyPlans: updatedPlan ? { ...prev.dailyPlans, [today]: updatedPlan } : prev.dailyPlans,
      };
    });
  }, [today, setState]);

  const completeSession = useCallback((timeSpent: number) => {
    setState(prev => {
      const todayPlan = prev.dailyPlans[today];
      const wasCompleted = todayPlan?.completed ?? false;
      
      let newStreak = prev.streak;
      let newLongest = prev.longestStreak;
      
      if (!wasCompleted) {
        if (prev.lastStudyDate && isConsecutiveDay(prev.lastStudyDate, today)) {
          newStreak = prev.streak + 1;
        } else if (prev.lastStudyDate !== today) {
          newStreak = 1;
        }
        newLongest = Math.max(newLongest, newStreak);
      }

      const updatedPlan = todayPlan ? {
        ...todayPlan,
        completed: true,
        stats: { ...todayPlan.stats, timeSpent: todayPlan.stats.timeSpent + timeSpent },
      } : undefined;

      const newlyMastered = Object.values(prev.wordProgress).filter(
        p => p.level >= 3 && p.lastReviewed === today
      ).length;

      return {
        ...prev,
        streak: newStreak,
        longestStreak: newLongest,
        lastStudyDate: today,
        totalWordsLearned: prev.totalWordsLearned + (wasCompleted ? 0 : newlyMastered),
        dailyPlans: updatedPlan ? { ...prev.dailyPlans, [today]: updatedPlan } : prev.dailyPlans,
        studyCalendar: { ...prev.studyCalendar, [today]: true },
      };
    });
  }, [today, setState]);

  const getTodayPlan = useCallback((): DailyPlan => {
    return state.dailyPlans[today] || getOrCreateDailyPlan();
  }, [state.dailyPlans, today, getOrCreateDailyPlan]);

  const todayPlan = getTodayPlan();
  const todayTotalWords = todayPlan.newWords.length + todayPlan.reviewWords.length;
  const todayCompleted = todayPlan.completed;

  const masteredCount = useMemo(() => 
    Object.values(state.wordProgress).filter(p => p.level >= 3).length,
  [state.wordProgress]);

  const learningCount = useMemo(() => 
    Object.values(state.wordProgress).filter(p => p.level > 0 && p.level < 3).length,
  [state.wordProgress]);

  return {
    vocab: VOCAB,
    vocabMap,
    state,
    todayPlan,
    todayTotalWords,
    todayCompleted,
    masteredCount,
    learningCount,
    recordAnswer,
    completeSession,
    getTodayPlan,
  };
}
