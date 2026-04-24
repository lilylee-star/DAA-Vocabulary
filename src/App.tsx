import { useState } from 'react';
import { useLearningEngine } from '@/hooks/useLearningEngine';
import HomePage from '@/components/HomePage';
import StudySession from '@/components/StudySession';
import ResultPage from '@/components/ResultPage';
import CalendarView from '@/components/CalendarView';

type Screen = 'home' | 'study' | 'result' | 'calendar';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const {
    state,
    todayPlan,
    todayTotalWords,
    todayCompleted,
    masteredCount,
    learningCount,
  } = useLearningEngine();

  return (
    <div className="min-h-screen bg-background">
      {screen === 'home' && (
        <HomePage
          state={state}
          todayPlan={todayPlan}
          todayTotalWords={todayTotalWords}
          todayCompleted={todayCompleted}
          masteredCount={masteredCount}
          learningCount={learningCount}
          onStartStudy={() => setScreen('study')}
          onViewCalendar={() => setScreen('calendar')}
        />
      )}
      {screen === 'study' && (
        <StudySession
          onFinish={() => setScreen('result')}
          onHome={() => setScreen('home')}
        />
      )}
      {screen === 'result' && (
        <ResultPage
          onHome={() => setScreen('home')}
          onRestart={() => setScreen('study')}
        />
      )}
      {screen === 'calendar' && (
        <CalendarView
          state={state}
          onHome={() => setScreen('home')}
        />
      )}
    </div>
  );
}
