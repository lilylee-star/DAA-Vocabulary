import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Flame, Home, CheckCircle2 } from 'lucide-react';
import type { UserState } from '@/types';

interface CalendarViewProps {
  state: UserState;
  onHome: () => void;
}

export default function CalendarView({ state, onHome }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const studiedThisMonth = Object.entries(state.studyCalendar).filter(([date]) => {
    const d = new Date(date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={onHome} className="p-2 -ml-2 rounded-full hover:bg-accent">
            <Home className="w-5 h-5" />
          </button>
          <h2 className="font-bold">学习日历</h2>
          <div className="w-9" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-accent">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg">{year}年 {monthNames[month]}</span>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-accent">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-50">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">本月学习</div>
              <div className="font-bold">{studiedThisMonth} 天</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">当前连续</div>
            <div className="font-bold text-orange-600">{state.streak} 天</div>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map(d => (
              <div key={d} className="text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
            
            {Array.from({ length: startDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const studied = state.studyCalendar[dateKey];
              const isToday = dateKey === new Date().toISOString().split('T')[0];
              
              return (
                <div 
                  key={day}
                  className={`relative py-2 rounded-lg text-sm ${
                    isToday ? 'font-bold' : ''
                  } ${
                    studied ? 'bg-green-50 text-green-700' : ''
                  }`}
                >
                  {day}
                  {studied && (
                    <CheckCircle2 className="w-3 h-3 absolute top-0.5 right-0.5 text-green-500" />
                  )}
                  {isToday && !studied && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full absolute bottom-0.5 left-1/2 -translate-x-1/2" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
            <span>已学习</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span>今天</span>
          </div>
        </div>
      </div>
    </div>
  );
}
