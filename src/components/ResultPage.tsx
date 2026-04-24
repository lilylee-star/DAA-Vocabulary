import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Home, RotateCcw, Star } from 'lucide-react';
import { useLearningEngine } from '@/hooks/useLearningEngine';

interface ResultPageProps {
  onHome: () => void;
  onRestart: () => void;
}

export default function ResultPage({ onHome, onRestart }: ResultPageProps) {
  const { todayPlan, state } = useLearningEngine();
  const stats = todayPlan.stats || { correct: 0, wrong: 0, timeSpent: 0 };
  const total = stats.correct + stats.wrong;
  const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
  const isPerfect = stats.wrong === 0 && total > 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}分${sec}秒`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        {/* Trophy */}
        <div className={`p-6 rounded-full ${isPerfect ? 'bg-yellow-50' : 'bg-primary/5'}`}>
          {isPerfect ? (
            <Trophy className="w-16 h-16 text-yellow-500" />
          ) : (
            <Star className="w-16 h-16 text-primary" />
          )}
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">
            {isPerfect ? '完美完成！' : accuracy >= 80 ? '做得不错！' : '继续加油！'}
          </h2>
          <p className="text-muted-foreground">
            {isPerfect ? '全部答对，太棒了！' : `正确率 ${accuracy}%，还有进步空间`}
          </p>
        </div>

        {/* Stats */}
        <div className="w-full grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
            <div className="text-xs text-muted-foreground">答对</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.wrong}</div>
            <div className="text-xs text-muted-foreground">答错</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{formatTime(stats.timeSpent)}</div>
            <div className="text-xs text-muted-foreground">用时</div>
          </Card>
        </div>

        {/* Accuracy Bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span>正确率</span>
            <span className="font-medium">{accuracy}%</span>
          </div>
          <Progress value={accuracy} className="h-3" />
        </div>

        {/* Streak */}
        {state.streak > 0 && (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-full">
            <Trophy className="w-5 h-5" />
            <span className="font-bold">连续学习 {state.streak} 天</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 space-y-3">
        <Button onClick={onRestart} className="w-full py-6 text-lg">
          <RotateCcw className="w-5 h-5 mr-2" /> 再来一组
        </Button>
        <Button variant="outline" onClick={onHome} className="w-full py-5">
          <Home className="w-5 h-5 mr-2" /> 返回首页
        </Button>
      </div>
    </div>
  );
}
