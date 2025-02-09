import { CalendarEvent } from "@/types/calendar";

export const weekDays = ["月", "火", "水", "木", "金", "土", "日"];

export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // 月曜始まりに調整

  // 前月の日付を追加
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevDate = new Date(year, month, -i);
    days.unshift(prevDate);
  }

  // 当月の日付を追加
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // 次月の日付を追加（6週間分になるまで）
  while (days.length < 42) {
    const nextDate: Date = new Date(
      year,
      month,
      days.length - firstDayOfWeek + 1
    );
    days.push(nextDate);
  }

  return days;
};

export const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isSelected = (date: Date, selectedDate: Date | null) => {
  return selectedDate?.getTime() === date.getTime();
};

export const getEventsForDate = (
  events: CalendarEvent[],
  date: Date | undefined
) => {
  if (!date) return [];

  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = jstDate.toISOString().split("T")[0];

  const eventsForDate = events.filter((event) => {
    const eventDate = new Date(event.start.dateTime || event.start.date || "");
    const jstEventDate = new Date(eventDate.getTime() + 9 * 60 * 60 * 1000);
    const eventDateStr = jstEventDate.toISOString().split("T")[0];
    return eventDateStr === dateStr;
  });
  return eventsForDate;
};

export const getEventTime = (event: CalendarEvent) => {
  if (!event.start.dateTime) {
    const date = new Date(event.start.date || "");
    return date.getTime();
  }
  return new Date(event.start.dateTime).getTime();
};

export const sortEventsByTime = (events: CalendarEvent[]) => {
  const allDayEvents = events
    .filter((event) => !event.start.dateTime)
    .sort((a, b) => {
      const aTime = new Date(a.start.date || "").getTime();
      const bTime = new Date(b.start.date || "").getTime();
      return aTime - bTime;
    });

  const timedEvents = events
    .filter((event) => event.start.dateTime)
    .sort((a, b) => {
      const aTime = getEventTime(a);
      const bTime = getEventTime(b);
      return aTime - bTime;
    });

  return { allDayEvents, timedEvents };
};

// 月の最初と最後の日を取得する関数を追加
export const getMonthBoundaries = (date: Date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { firstDayOfMonth, lastDayOfMonth };
};

export const getAdjustedMonthDate = (
  monthOffset: number,
  currentDate: Date
): Date => {
  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + monthOffset,
    1
  );
};
