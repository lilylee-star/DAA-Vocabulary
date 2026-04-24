import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Flame, Trophy, Calendar, ChevronRight, Brain, Volume2 } from 'lucide-react';
import type { UserState, DailyPlan } from '@/types';

interface HomePageProps {
  state: UserState;
  todayPlan: DailyPlan;
  todayTotalWords: number;
  todayCompleted: boolean;
  masteredCount: number;
  learningCount: number;
  onStartStudy: () => void;
  onViewCalendar: () => void;
}

export default function HomePage({ 
  state, todayPlan, todayTotalWords, todayCompleted, 
  masteredCount, learningCount, onStartStudy, onViewCalendar 
}: HomePageProps) {
  const remainingNew = todayPlan.newWords.length;
  const remainingReview = todayPlan.reviewWords.length;

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">DAA 专业词汇记忆工具</h1>
            <p className="text-sm text-muted-foreground">NB & MNT 专业英语词汇</p>
            <p className="text-xs text-muted-foreground mt-1">Developed by Lily</p>
          </div>
          <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-bold text-orange-600">{state.streak}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{masteredCount}</div>
          <div className="text-xs text-muted-foreground">已掌握</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{learningCount}</div>
          <div className="text-xs text-muted-foreground">学习中</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-purple-500">{state.totalCorrect}</div>
          <div className="text-xs text-muted-foreground">答对次数</div>
        </Card>
      </div>

      {/* Today's Task */}
      <div className="px-5 py-2">
        <Card className={`p-5 ${todayCompleted ? 'bg-green-50 border-green-200' : 'bg-card'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className={`w-5 h-5 ${todayCompleted ? 'text-green-600' : 'text-primary'}`} />
              <span className="font-semibold">{todayCompleted ? '今日已完成' : '今日学习任务'}</span>
            </div>
            {todayCompleted && <Trophy className="w-5 h-5 text-yellow-500" />}
          </div>
          
          {!todayCompleted && (
            <>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">新词 {remainingNew} + 复习 {remainingReview}</span>
                <span className="font-medium">共 {todayTotalWords} 个</span>
              </div>
              <Progress value={0} className="h-2 mb-4" />
              <Button onClick={onStartStudy} className="w-full py-5 text-lg">
                开始学习 <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </>
          )}
          
          {todayCompleted && (
            <div className="text-center space-y-3">
              <div className="text-green-700 font-medium">太棒了！今日目标已达成</div>
              <Button variant="outline" onClick={onStartStudy} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" /> 再次练习
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Features */}
      <div className="px-5 py-4 space-y-3">
        <div className="text-sm font-semibold text-muted-foreground">学习功能</div>
        
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50">
            <Brain className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="font-medium">智能复习</div>
            <div className="text-xs text-muted-foreground">根据掌握程度自动安排复习</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50">
            <Volume2 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <div className="font-medium">真人发音</div>
            <div className="text-xs text-muted-foreground">点击即可收听标准美式发音</div>
          </div>
        </Card>

        <Card 
          className="p-4 flex items-center gap-4 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={onViewCalendar}
        >
          <div className="p-3 rounded-xl bg-orange-50">
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <div className="font-medium">学习日历</div>
            <div className="text-xs text-muted-foreground">查看学习记录和连续打卡</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Card>
      </div>

      {/* Footer */}
      <div className="flex-1 flex items-end justify-center p-5">
        <p className="text-xs text-muted-foreground text-center">
          基于 NB & MNT Biweekly Meeting 词汇表<br />
          每日10词，轻松掌握面板行业英语
        </p>
      </div>
    </div>
  );
}

function RotateCcw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  );
}
