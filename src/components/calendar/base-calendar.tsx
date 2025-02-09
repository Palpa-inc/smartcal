/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/contexts/CalendarContext";
import {
  isToday,
  isSelected,
  getMonthBoundaries,
  getEventsForDate,
  getAdjustedMonthDate,
} from "@/lib/calendar";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CalendarProps {
  instanceId: string;
}

export function Calendar({ instanceId }: CalendarProps) {
  const {
    allEvents,
    calendars,
    loading,
    date: currentDate,
    setDate,
  } = useCalendar();

  const { firstDayOfMonth, lastDayOfMonth } = getMonthBoundaries(currentDate);

  // カレンダーグリッドの日付を生成
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  // 前月の日数を取得
  const daysInPrevMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).getDate();

  const days = [];
  const weeks = [];

  // 前月の日付を追加
  const adjustedStartDay = (startDay + 6) % 7; // 月曜始まりに調整
  for (let i = adjustedStartDay; i > 0; i--) {
    days.push({
      date: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        daysInPrevMonth - i + 1
      ),
      isCurrentMonth: false,
      events: [], // イベントの配列を追加
    });
  }

  // 現在の月の日付を追加
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    // その日のイベントをフィルタリング
    const eventsForDate = getEventsForDate(allEvents, date);

    days.push({
      date,
      isCurrentMonth: true,
      events: eventsForDate,
    });
  }

  // 次月の日付を追加
  const remainingDays = 42 - days.length; // 6週間分のグリッド
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
      isCurrentMonth: false,
      events: [], // イベントの配列を追加
    });
  }

  // 週ごとに分割
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const handlePrevMonth = () => {
    setDate(getAdjustedMonthDate(-1, currentDate));
  };

  const handleNextMonth = () => {
    setDate(getAdjustedMonthDate(1, currentDate));
  };

  return (
    <Card className={calendarStyles.container}>
      <CardHeader className={calendarStyles.header}>
        <div className={calendarStyles.navigation}>
          <Button
            variant="ghost"
            onClick={handlePrevMonth}
            className={calendarStyles.navButton}
          >
            <ChevronLeft className={calendarStyles.navIcon} />
          </Button>
          <h2 className={calendarStyles.title}>
            {currentDate.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
            })}
          </h2>
          <Button
            variant="ghost"
            onClick={handleNextMonth}
            className={calendarStyles.navButton}
          >
            <ChevronRight className={calendarStyles.navIcon} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={calendarStyles.content}>
        <div className={calendarStyles.grid}>
          {["月", "火", "水", "木", "金", "土", "日"].map((day) => (
            <div key={day} className={calendarStyles.weekday}>
              {day}
            </div>
          ))}
          {weeks.map((week, weekIndex) =>
            week.map(({ date, isCurrentMonth, events }, dayIndex) => {
              const hasEvents = events.length > 0;
              const isDateSelected =
                currentDate.getFullYear() === date.getFullYear() &&
                currentDate.getMonth() === date.getMonth() &&
                currentDate.getDate() === date.getDate();
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(calendarStyles.day, {
                    [calendarStyles.dayMuted]: !isCurrentMonth,
                    [calendarStyles.dayToday]: isToday(date),
                  })}
                  onClick={() => setDate(date)}
                >
                  {isDateSelected && (
                    <motion.div
                      layoutId={`calendar-${instanceId}-selectedDate`}
                      className={calendarStyles.daySelected}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: "6px",
                      }}
                    />
                  )}
                  <div
                    className={cn(calendarStyles.dayContent, {
                      "relative text-white dark:text-background z-10":
                        isDateSelected,
                    })}
                  >
                    <span className={calendarStyles.dayNumber}>
                      {date.getDate()}
                    </span>
                    {hasEvents ? (
                      <>
                        <div
                          className={cn(calendarStyles.eventIndicator, {
                            [calendarStyles.eventIndicatorDefault]:
                              isCurrentMonth,
                            [calendarStyles.eventIndicatorMuted]:
                              !isCurrentMonth,
                            [calendarStyles.eventIndicatorSelected]: isSelected(
                              currentDate,
                              date
                            ),
                          })}
                          style={{
                            backgroundColor: calendars.find(
                              (calendar) =>
                                calendar.email === events[0].parentEmail
                            )?.color?.background,
                          }}
                        />
                      </>
                    ) : (
                      <div className={calendarStyles.eventIndicatorEmpty} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 z-50">
          <LoadingSpinner className="text-primary" />
        </div>
      )}
    </Card>
  );
}

const calendarStyles = {
  container: "calendar relative bg-background dark:border-white/20",
  header: "p-4 gap-2",
  navigation: "flex items-center justify-between",
  navButton: "h-7 w-7 p-0",
  navIcon: "h-4 w-4",
  title: "font-semibold",
  content: "p-4 pt-0",
  grid: "grid grid-cols-7 gap-0",
  weekday: "h-6 flex items-center justify-center text-sm font-medium",
  day: "aspect-square p-0.5 relative cursor-pointer hover:bg-muted/50 rounded-md",
  dayContent: "w-full h-fit flex flex-col items-center justify-start pt-1 pb-2",
  dayNumber: "text-sm",
  dayMuted: "text-muted-foreground/40",
  dayToday: "bg-primary/10 border border-primary/20",
  daySelected:
    "bg-primary hover:bg-primary/90 text-white dark:text-background z-10",
  eventIndicator: "w-1.5 h-1.5 rounded-full mt-0.5",
  eventIndicatorDefault: "bg-primary",
  eventIndicatorMuted: "bg-muted-foreground",
  eventIndicatorSelected: "bg-white dark:bg-background",
  eventIndicatorEmpty: "w-1.5 h-1.5 rounded-full mt-0.5 bg-transparent",
} as const;
