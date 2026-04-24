export interface WordProgress {
  word: string;
  level: number;
  correctCount: number;
  wrongCount: number;
  lastReviewed: string | null;
  nextReview: string | null;
  history: boolean[];
}

export interface DailyPlan {
  date: string;
  newWords: string[];
  reviewWords: string[];
  completed: boolean;
  stats: {
    correct: number;
    wrong: number;
    timeSpent: number;
  };
}

export interface UserState {
  streak: number;
  longestStreak: number;
  totalWordsLearned: number;
  totalCorrect: number;
  totalWrong: number;
  startDate: string;
  lastStudyDate: string | null;
  wordProgress: Record<string, WordProgress>;
  dailyPlans: Record<string, DailyPlan>;
  studyCalendar: Record<string, boolean>;
}

export type QuizType = 'learn' | 'match' | 'fillblank' | 'listen';
