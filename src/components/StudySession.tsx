import { useState, useEffect, useCallback } from 'react';
import { useLearningEngine } from '@/hooks/useLearningEngine';
import { useSpeech } from '@/hooks/useSpeech';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Home, Volume2, CheckCircle2, XCircle, ChevronRight, Trophy } from 'lucide-react';

const QuizType = ['learn', 'match', 'fillblank', 'listen'] as const;
type QuizType = typeof QuizType[number];

interface StudySessionProps {
  onFinish: () => void;
  onHome: () => void;
}

export default function StudySession({ onFinish, onHome }: StudySessionProps) {
  const { vocabMap, todayPlan, recordAnswer, completeSession, todayTotalWords } = useLearningEngine();
  const { speak } = useSpeech();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizPhase, setQuizPhase] = useState<QuizType>('learn');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean | null>(null);
  const [startTime] = useState(Date.now());
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const allWords = [...todayPlan.newWords, ...todayPlan.reviewWords];
  const currentWord = allWords[currentIndex];
  const currentVocab = currentWord ? vocabMap[currentWord] : null;

  const generateOptions = useCallback((correct: string, pool: string[], count = 4) => {
    const others = pool.filter(w => w !== correct).sort(() => Math.random() - 0.5).slice(0, count - 1);
    return [correct, ...others].sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    if (currentVocab && (quizPhase === 'match' || quizPhase === 'listen')) {
      const opts = generateOptions(currentVocab.word, Object.keys(vocabMap));
      setShuffledOptions(opts);
    }
    if (currentVocab && quizPhase === 'fillblank') {
      const opts = generateOptions(currentVocab.word, Object.keys(vocabMap));
      setShuffledOptions(opts);
    }
  }, [currentVocab, quizPhase, generateOptions, vocabMap]);

  useEffect(() => {
    if (currentVocab && quizPhase === 'learn') {
      speak(currentVocab.word);
    }
  }, [currentVocab, quizPhase, speak]);

  const progress = ((currentIndex * 4 + (['learn', 'match', 'fillblank', 'listen'].indexOf(quizPhase))) / (todayTotalWords * 4)) * 100;

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(null);
    
    const phases: QuizType[] = ['learn', 'match', 'fillblank', 'listen'];
    const phaseIdx = phases.indexOf(quizPhase);
    
    if (phaseIdx < 3) {
      setQuizPhase(phases[phaseIdx + 1]);
    } else {
      if (currentIndex < allWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setQuizPhase('learn');
      } else {
        // Finish session
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        completeSession(timeSpent);
        onFinish();
      }
    }
  };

  const handleOptionSelect = (option: string) => {
    if (showResult !== null) return;
    setSelectedOption(option);
    const correct = option === currentVocab?.word;
    setShowResult(correct);
    if (currentVocab) {
      recordAnswer(currentVocab.word, correct);
      if (correct) {
        speak(currentVocab.word);
      }
    }
  };

  const handleLearnContinue = () => {
    setQuizPhase('match');
    setShowResult(null);
  };

  if (!currentVocab) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">今日任务已完成！</h2>
          <p className="text-muted-foreground mb-6">你已经完成了今天的所有单词</p>
          <Button onClick={onHome} className="w-full max-w-xs">返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onHome} className="p-2 -ml-2 rounded-full hover:bg-accent">
            <Home className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            {currentIndex + 1}/{todayTotalWords}
          </span>
          <div className="w-9" />
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Quiz Content */}
      <div className="flex-1 p-4">
        {/* LEARN CARD */}
        {quizPhase === 'learn' && (
          <div className="space-y-6">
            <Card className="p-6 text-center space-y-4">
              <div className="text-3xl font-bold">{currentVocab.word}</div>
              <div className="text-lg text-muted-foreground">{currentVocab.phonetic}</div>
              <button 
                onClick={() => speak(currentVocab.word)}
                className="mx-auto p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Volume2 className="w-6 h-6 text-primary" />
              </button>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="font-medium text-lg">{currentVocab.meaning_cn}</div>
              <div className="text-sm text-muted-foreground">{currentVocab.meaning_en}</div>
            </Card>

            <Card className="p-5 space-y-3 bg-muted/50">
              <div className="text-sm font-medium text-muted-foreground">专业场景例句</div>
              <div className="text-sm leading-relaxed">{currentVocab.example_en}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{currentVocab.example_cn}</div>
            </Card>

            <Button onClick={handleLearnContinue} className="w-full py-6 text-lg">
              继续 <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* MATCH QUIZ */}
        {quizPhase === 'match' && (
          <div className="space-y-6">
            <div className="text-center space-y-2 py-4">
              <div className="text-2xl font-bold">{currentVocab.meaning_cn}</div>
              <div className="text-sm text-muted-foreground">选择正确的英文单词</div>
            </div>

            <div className="grid gap-3">
              {shuffledOptions.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentVocab.word;
                const showCorrect = showResult !== null;
                
                let btnClass = "p-4 text-left rounded-xl border-2 transition-all ";
                if (!showCorrect) {
                  btnClass += isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50";
                } else if (isCorrect) {
                  btnClass += "border-green-500 bg-green-50";
                } else if (isSelected && !isCorrect) {
                  btnClass += "border-red-500 bg-red-50";
                } else {
                  btnClass += "border-border opacity-60";
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={showCorrect}
                    className={btnClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{opt}</span>
                      {showCorrect && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {showCorrect && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult !== null && (
              <Button 
                onClick={handleNext}
                className={`w-full py-6 text-lg ${showResult ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {showResult ? '答对了！' : '答错了'} <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* FILL BLANK */}
        {quizPhase === 'fillblank' && (
          <div className="space-y-6">
            <div className="text-center space-y-2 py-4">
              <div className="text-sm text-muted-foreground">选择正确的单词填入句子</div>
            </div>

            <Card className="p-5 leading-relaxed text-base">
              {currentVocab.example_en.replace(currentVocab.word, '_______')}
            </Card>

            <div className="grid gap-3">
              {shuffledOptions.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentVocab.word;
                const showCorrect = showResult !== null;
                
                let btnClass = "p-4 text-left rounded-xl border-2 transition-all ";
                if (!showCorrect) {
                  btnClass += isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50";
                } else if (isCorrect) {
                  btnClass += "border-green-500 bg-green-50";
                } else if (isSelected && !isCorrect) {
                  btnClass += "border-red-500 bg-red-50";
                } else {
                  btnClass += "border-border opacity-60";
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={showCorrect}
                    className={btnClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{opt}</span>
                      {showCorrect && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {showCorrect && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult !== null && (
              <Button 
                onClick={handleNext}
                className={`w-full py-6 text-lg ${showResult ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {showResult ? '答对了！' : '答错了'} <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* LISTEN QUIZ */}
        {quizPhase === 'listen' && (
          <div className="space-y-6">
            <div className="text-center space-y-4 py-4">
              <button 
                onClick={() => speak(currentVocab.word)}
                className="mx-auto p-6 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Volume2 className="w-10 h-10 text-primary" />
              </button>
              <div className="text-sm text-muted-foreground">点击播放，选择你听到的单词</div>
            </div>

            <div className="grid gap-3">
              {shuffledOptions.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentVocab.word;
                const showCorrect = showResult !== null;
                
                let btnClass = "p-4 text-left rounded-xl border-2 transition-all ";
                if (!showCorrect) {
                  btnClass += isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50";
                } else if (isCorrect) {
                  btnClass += "border-green-500 bg-green-50";
                } else if (isSelected && !isCorrect) {
                  btnClass += "border-red-500 bg-red-50";
                } else {
                  btnClass += "border-border opacity-60";
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={showCorrect}
                    className={btnClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{opt}</span>
                      {showCorrect && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {showCorrect && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult !== null && (
              <Button 
                onClick={handleNext}
                className={`w-full py-6 text-lg ${showResult ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {showResult ? '答对了！' : '答错了'} <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
