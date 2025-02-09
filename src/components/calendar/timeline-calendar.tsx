import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useCalendar } from "@/contexts/CalendarContext";
import { CalendarEvent } from "@/types/calendar";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { EventDialog } from "../event/detail-event";

const TimelineCalendar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { allEvents, date, setDate, calendars, loading } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  // 初期スクロール位置を設定
  useEffect(() => {
    if (containerRef.current) {
      // 1時間あたりの高さ（min-h-[60px]と同じ値）× 9時間分
      const scrollPosition = 60 * 9;
      containerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  // 時間の目盛りを生成（0時から23時まで）
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // 週の日付を生成（メモ化）
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        addDays(startOfWeek(date, { weekStartsOn: 1 }), i)
      ),
    [date]
  );

  // イベントを日付と時間でグループ化（メモ化）
  const eventsByDayAndHour = useMemo(() => {
    const grouped = new Map();

    allEvents.forEach((event) => {
      if (!event.start.dateTime || !event.end.dateTime) return;
      const eventStart = new Date(event.start.dateTime);
      const eventDate = eventStart.toDateString();
      const eventHour = eventStart.getHours();

      const key = `${eventDate}-${eventHour}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(event);
    });

    return grouped;
  }, [allEvents]);

  // getEventsForHourAndDay を最適化
  const getEventsForHourAndDay = useCallback(
    (hour: number, day: Date): CalendarEvent[] => {
      const key = `${day.toDateString()}-${hour}`;
      return eventsByDayAndHour.get(key) || [];
    },
    [eventsByDayAndHour]
  );

  // hasEventsInTimeSlot を修正して半時間ごとのチェックができるようにする
  const hasEventsInTimeSlot = useCallback(
    (
      hour: number,
      day: Date,
      half: "first" | "second" | "both" = "both"
    ): boolean => {
      const firstHalfStart = new Date(day);
      firstHalfStart.setHours(hour, 0, 0, 0);
      const firstHalfEnd = new Date(day);
      firstHalfEnd.setHours(hour, 30, 0, 0);

      const secondHalfStart = new Date(day);
      secondHalfStart.setHours(hour, 30, 0, 0);
      const secondHalfEnd = new Date(day);
      secondHalfEnd.setHours(hour + 1, 0, 0, 0);

      return allEvents.some((event) => {
        if (!event.start.dateTime || !event.end.dateTime) return false;
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);

        const isEventOnSameDay = isSameDay(day, eventStart);

        if (half === "first") {
          return (
            isEventOnSameDay &&
            eventStart < firstHalfEnd &&
            eventEnd > firstHalfStart
          );
        } else if (half === "second") {
          return (
            isEventOnSameDay &&
            eventStart < secondHalfEnd &&
            eventEnd > secondHalfStart
          );
        } else {
          return (
            isEventOnSameDay &&
            eventStart < firstHalfEnd &&
            eventEnd > firstHalfStart
          );
        }
      });
    },
    [allEvents]
  );

  // 週の移動処理を追加
  const handleWeekChange = (direction: "prev" | "next") => {
    setDate(addDays(date, direction === "prev" ? -7 : 7));
  };

  // イベントの位置とサイズを計算する関数
  const calculateEventStyle = useCallback((event: CalendarEvent) => {
    const start = new Date(event.start.dateTime!);
    const end = new Date(event.end.dateTime!);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const topPosition = (startMinutes % 60) * (57 / 60);
    const duration = endMinutes - startMinutes;
    const height = (duration / 60) * 57;

    return {
      top: `${topPosition}px`,
      height: `${height}px`,
    };
  }, []);

  // 同じタイトルのイベントが連続する日数を計算
  const getConsecutiveDays = (
    event: CalendarEvent,
    dayIndex: number,
    hour: number
  ): number => {
    let consecutiveDays = 1;
    for (let i = dayIndex + 1; i < weekDays.length; i++) {
      const eventsOnDay = getEventsForHourAndDay(hour, weekDays[i]);
      if (eventsOnDay.some((e) => e.summary === event.summary)) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    return consecutiveDays;
  };

  // 既に表示済みのイベントかチェック
  const isEventAlreadyDisplayed = (
    event: CalendarEvent,
    dayIndex: number,
    hour: number
  ): boolean => {
    for (let i = 0; i < dayIndex; i++) {
      const eventsOnDay = getEventsForHourAndDay(hour, weekDays[i]);
      if (eventsOnDay.some((e) => e.summary === event.summary)) {
        return true;
      }
    }
    return false;
  };

  // 終日予定を取得する関数を追加
  const getAllDayEvents = useCallback(
    (day: Date): CalendarEvent[] => {
      return allEvents.filter((event) => {
        if (!event.start.date && !event.end.date && !event.start.dateTime)
          return false;
        const eventDate = event.start.date
          ? new Date(event.start.date)
          : new Date(event.start.dateTime!);
        return (
          isSameDay(day, eventDate) &&
          (!event.start.dateTime || !event.end.dateTime)
        );
      });
    },
    [allEvents]
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-[calc(100vh-120px)] overflow-auto bg-white rounded-xl"
    >
      {/* ヘッダー（曜日） */}
      <div className="z-40 grid grid-cols-[80px_repeat(7,1fr)] sticky top-0 bg-background text-foreground border-t border-x border-gray-200 rounded-t-xl shadow-sm">
        <div className="border-b p-2 dark:border-gray-200 text-sm font-medium rounded-tl-xl flex items-center justify-between">
          <button
            onClick={() => handleWeekChange("prev")}
            className="hover:bg-blue-50 rounded p-1"
            aria-label="前の週"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleWeekChange("next")}
            className="hover:bg-blue-50 rounded p-1"
            aria-label="次の週"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {weekDays.map((day, index) => (
          <div
            key={day.toString()}
            className={`hover:bg-blue-50 hover:dark:text-blue-500 cursor-pointer border-b ${
              index < 6 ? "border-r" : "rounded-tr-xl" // 最後の列以外にborder-rを適用
            } ${
              index === 0 ? "border-l" : ""
            } border-gray-200 p-1 text-center ${
              isSameDay(day, date) ? "bg-blue-50 text-blue-500 " : ""
            } `}
            onClick={() => setDate(day)}
          >
            <div className="text-sm font-medium">
              {format(day, "d", { locale: ja })}
            </div>
            <div className="text-xs">{format(day, "E", { locale: ja })}</div>
          </div>
        ))}
      </div>

      {/* 終日予定セクションを追加 */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] text-foreground border-x border-gray-200">
        <div className="bg-background border-r border-b border-gray-200 p-2 pl-6 text-sm flex items-center">
          終日
        </div>
        {weekDays.map((day, index) => (
          <div
            key={`allday-${day}`}
            className={`border-b ${
              index < 6 ? "border-r" : ""
            } border-gray-100 relative min-h-[60px] ${
              isSameDay(day, date) ? "bg-blue-200" : "bg-background/30"
            }`}
          >
            {getAllDayEvents(day).map((event) => (
              <div
                key={`${event.id}-timeline-calendar`}
                className="m-1 p-1 rounded-md shadow-sm text-sm cursor-pointer overflow-hidden"
                style={{
                  backgroundColor: calendars.find(
                    (calendar) => calendar.email === event.parentEmail
                  )?.color?.background,
                  color: calendars.find(
                    (calendar) => calendar.email === event.parentEmail
                  )?.color?.foreground,
                  border: `1px solid ${
                    calendars.find(
                      (calendar) => calendar.email === event.parentEmail
                    )?.color?.foreground
                  }`,
                }}
              >
                {event.summary}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* タイムライン */}
      {timeSlots.map((hour) => {
        return (
          <div
            key={hour}
            className={`grid grid-cols-[80px_repeat(7,1fr)] text-foreground border-x border-gray-200 ${
              hour === 23 ? "rounded-bl-xl" : ""
            }`}
          >
            <div
              className={`bg-background border-r ${
                hour < 23 ? "border-b" : "rounded-bl-xl"
              } border-gray-200 p-2 text-sm flex justify-between items-center pl-5`}
            >
              {`${hour.toString().padStart(2, "0")}:00`}
            </div>
            {weekDays.map((day, index) => {
              const hasEventsFirstHalf = hasEventsInTimeSlot(
                hour,
                day,
                "first"
              );
              const hasEventsSecondHalf = hasEventsInTimeSlot(
                hour,
                day,
                "second"
              );
              const isFullHourEmpty =
                !hasEventsFirstHalf && !hasEventsSecondHalf;

              return (
                <div
                  key={`${day}-${hour}`}
                  className={` ${hour < 23 ? "border-b" : ""} ${
                    index < 6 ? "border-r" : ""
                  } border-gray-100 relative min-h-[60px] ${
                    isSameDay(day, date) ? "bg-blue-200" : "bg-background/30"
                  }`}
                >
                  {/* 1時間全体が空いている場合 */}
                  {!loading && (
                    <>
                      {isFullHourEmpty ? (
                        <div
                          className={`absolute inset-1 border border-dashed rounded-md ${
                            isSameDay(day, date)
                              ? "bg-background/20 border-green-300"
                              : "bg-green-50/10 dark:bg-green-50/40 border-green-300/40 dark:border-green-600/40 "
                          } pointer-events-none z-10`}
                          style={{
                            top: "4px",
                            height: "52px",
                          }}
                        />
                      ) : (
                        <>
                          {/* 前半30分の空き時間 */}
                          {!hasEventsFirstHalf && (
                            <div
                              className={`absolute inset-1 border border-dashed rounded-md ${
                                isSameDay(day, date)
                                  ? "bg-background/20 border-green-300"
                                  : "bg-green-50/10 dark:bg-green-50/40 border-green-300/40 dark:border-green-600/40"
                              } pointer-events-none z-10`}
                              style={{
                                top: "4px",
                                height: "24px",
                              }}
                            />
                          )}
                          {/* 後半30分の空き時間 */}
                          {!hasEventsSecondHalf && (
                            <div
                              className={`absolute inset-1 border border-dashed rounded-md ${
                                isSameDay(day, date)
                                  ? "bg-background/20 border-green-300"
                                  : "bg-green-50/10 dark:bg-green-50/40 border-green-300/40 dark:border-green-600/40"
                              } pointer-events-none z-10`}
                              style={{
                                top: "34px",
                                height: "22px",
                              }}
                            />
                          )}
                        </>
                      )}
                    </>
                  )}
                  {getEventsForHourAndDay(hour, day).map((event) => {
                    // 既に表示済みのイベントはスキップ
                    if (isEventAlreadyDisplayed(event, index, hour)) {
                      return null;
                    }

                    const consecutiveDays = getConsecutiveDays(
                      event,
                      index,
                      hour
                    );
                    const eventStyle = calculateEventStyle(event);

                    return (
                      <div
                        key={`${event.id}-${index}-${event.parentEmail}-timeline-calendar`}
                        className={`absolute left-0 right-1 ml-1 mt-0.5 pt-0.5 pl-1.5 border border-gray-100 rounded-md shadow-sm text-sm transition-colors cursor-pointer whitespace-nowrap overflow-hidden`}
                        style={{
                          ...eventStyle,
                          width: `calc(${consecutiveDays * 100}% - 8px)`,
                          zIndex: consecutiveDays === 1 ? 20 : 10, // 単発の予定は z-index を高く設定
                          backgroundColor: calendars.find(
                            (calendar) => calendar.email === event.parentEmail
                          )?.color?.background,
                          color: calendars.find(
                            (calendar) => calendar.email === event.parentEmail
                          )?.color?.foreground,
                        }}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-1 mt-0.5">
                          {event.summary}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      <EventDialog
        event={selectedEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default TimelineCalendar;
