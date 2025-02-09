"use client";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VideoIcon } from "lucide-react";
import { cn, formatDateOnly, formatTime, getTimeStatus } from "@/lib/utils";
import { useCalendar } from "@/contexts/CalendarContext";
import { getEventsForDate, sortEventsByTime } from "@/lib/calendar";
import { EventDialog } from "@/components/event/detail-event";
import { CreateEventDialog } from "@/components/event/create-event";
import { CalendarEvent } from "@/types/calendar";

const eventVariants_1: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

const eventVariants_2: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function EventList() {
  const { allEvents, calendars, date, setDate } = useCalendar();
  const [isOpen, setIsOpen] = useState(false);
  const [CreateEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [isTantitive, setIsTantitive] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // スライド方向を追跡するための状態を追加
  const [, setSlideDirection] = useState(0);
  // 日付変更ハンドラーを修正
  const handleDateChange = (offset: number) => {
    if (date) {
      setSlideDirection(offset);
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + offset);
      setDate(newDate);
    }
  };

  const eventsForDate = getEventsForDate(allEvents, date);
  const sortedEvents = sortEventsByTime(eventsForDate);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  const handleCreateEventClick = (isTantitive: boolean) => {
    setCreateEventDialogOpen(true);
    setIsTantitive(isTantitive);
  };

  return (
    <div className="min-h-0">
      <Card className="h-full overflow-hidden">
        <CardHeader className={eventListStyles.cardHeader}>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => handleDateChange(-1)}
              className={eventListStyles.navigationButton}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <AnimatePresence mode="wait">
              <motion.div
                key={date?.toISOString() || "no-date"}
                variants={eventVariants_1}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <CardTitle className={eventListStyles.dateTitle}>
                  {date ? formatDateOnly(date) : "日付を選択してください"}
                </CardTitle>
              </motion.div>
            </AnimatePresence>
            <Button
              variant="ghost"
              onClick={() => handleDateChange(1)}
              className={eventListStyles.navigationButton}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleCreateEventClick(false)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              予定を作成
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCreateEventClick(true)}
            >
              <CalendarClock className="h-4 w-4 mr-2" />
              仮押さえ
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={date?.toISOString() || "no-date"}
              variants={eventVariants_2}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {date ? (
                <div className="space-y-2">
                  {/* 終日の予定 */}
                  {sortedEvents.allDayEvents.length > 0 && (
                    <div className="space-y-2">
                      <h3 className={eventListStyles.sectionTitle}>終日</h3>
                      <div className="space-y-2">
                        {sortedEvents.allDayEvents.map((event) => {
                          const timeStatus = getTimeStatus(
                            event.start.dateTime!,
                            event.end.dateTime!
                          );
                          return (
                            <div
                              key={event.id}
                              onClick={() => handleEventClick(event)}
                              className={eventListStyles.allDayEvent}
                              style={{
                                backgroundColor: calendars.find(
                                  (calendar) =>
                                    calendar.email === event.parentEmail
                                )?.color?.background,
                                color:
                                  timeStatus !== "past"
                                    ? calendars.find(
                                        (calendar) =>
                                          calendar.email === event.parentEmail
                                      )?.color?.foreground
                                    : "",
                              }}
                            >
                              <p className={eventListStyles.allDayEventTitle}>
                                {event.summary}
                              </p>
                              <p
                                className={cn(
                                  eventListStyles.eventDetails.email,
                                  timeStatus === "past" &&
                                    eventListStyles.eventDetails.past
                                )}
                              >
                                {event.parentEmail}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 時間指定の予定 */}
                  {sortedEvents.timedEvents.length > 0 ? (
                    <div className={eventListStyles.timedEventsContainer}>
                      <h3 className={eventListStyles.sectionTitle}>時間指定</h3>
                      <div className={eventListStyles.timedEventsList}>
                        <AnimatePresence>
                          {sortedEvents.timedEvents.map((event) => {
                            const timeStatus = getTimeStatus(
                              event.start.dateTime!,
                              event.end.dateTime!
                            );

                            return (
                              <motion.div
                                key={event.id}
                                variants={eventVariants_2}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="relative"
                              >
                                <div
                                  className={cn(
                                    eventListStyles.timeIndicator.base,
                                    {
                                      [eventListStyles.timeIndicator.current]:
                                        timeStatus === "current",
                                      [eventListStyles.timeIndicator.past]:
                                        timeStatus === "past",
                                      [eventListStyles.timeIndicator.future]:
                                        timeStatus === "future",
                                    }
                                  )}
                                >
                                  <div
                                    className={cn(
                                      eventListStyles.timeIndicatorDot.base,
                                      {
                                        [eventListStyles.timeIndicatorDot
                                          .current]: timeStatus === "current",
                                        [eventListStyles.timeIndicatorDot.past]:
                                          timeStatus === "past",
                                        [eventListStyles.timeIndicatorDot
                                          .future]: timeStatus === "future",
                                      }
                                    )}
                                  />
                                </div>

                                <label
                                  className={cn(
                                    eventListStyles.timeLabel.base,
                                    {
                                      [eventListStyles.timeLabel.current]:
                                        timeStatus === "current",
                                      [eventListStyles.timeLabel.past]:
                                        timeStatus === "past",
                                      [eventListStyles.timeLabel.future]:
                                        timeStatus === "future",
                                    }
                                  )}
                                >
                                  {formatTime(event.start.dateTime!)}
                                </label>

                                <div
                                  onClick={() => handleEventClick(event)}
                                  className={cn(
                                    eventListStyles.eventCard.base,
                                    {
                                      [eventListStyles.eventCard.current]:
                                        timeStatus === "current",
                                      [eventListStyles.eventCard.past]:
                                        timeStatus === "past",
                                      [eventListStyles.eventCard.future]:
                                        timeStatus === "future",
                                    }
                                  )}
                                  style={{
                                    backgroundColor:
                                      timeStatus !== "past"
                                        ? calendars.find(
                                            (calendar) =>
                                              calendar.email ===
                                              event.parentEmail
                                          )?.color?.background
                                        : "",
                                    color:
                                      timeStatus !== "past"
                                        ? calendars.find(
                                            (calendar) =>
                                              calendar.email ===
                                              event.parentEmail
                                          )?.color?.foreground
                                        : "",
                                  }}
                                >
                                  <div className="flex flex-row items-center justify-between">
                                    <p
                                      className={cn(
                                        eventListStyles.eventTitle.base,
                                        timeStatus === "past" &&
                                          eventListStyles.eventTitle.past
                                      )}
                                    >
                                      {event.summary}
                                    </p>
                                    {event.hangoutLink && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className={cn(
                                          eventListStyles.meetButton.base,
                                          timeStatus === "past" &&
                                            eventListStyles.meetButton.past
                                        )}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(
                                            event.hangoutLink ?? undefined,
                                            "_blank"
                                          );
                                        }}
                                      >
                                        <VideoIcon className="h-3 w-3 mr-1" />
                                        参加
                                      </Button>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 whitespace-pre-line">
                                    <p
                                      className={cn(
                                        eventListStyles.eventDetails.email,
                                        timeStatus === "past" &&
                                          eventListStyles.eventDetails.past
                                      )}
                                    >
                                      {event.parentEmail}
                                    </p>

                                    <span
                                      className={cn(
                                        eventListStyles.eventDetails.text,
                                        timeStatus === "past" &&
                                          eventListStyles.eventDetails.past
                                      )}
                                    >
                                      {`${formatTime(
                                        event.start.dateTime!
                                      )} - ${formatTime(event.end.dateTime!)}`}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : null}

                  {/* 予定がない場合 */}
                  {eventsForDate.length === 0 && (
                    <p className="text-center py-4 text-muted-foreground">
                      予定はありません
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  日付を選択してください
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
      {/* ダイアログ */}
      <EventDialog
        event={selectedEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <CreateEventDialog
        isOpen={CreateEventDialogOpen}
        onClose={() => setCreateEventDialogOpen(false)}
        isTantitive={isTantitive}
      />
    </div>
  );
}

const eventListStyles = {
  container: "space-y-4",
  card: "w-full bg-background dark:border-white/20",
  cardHeader: "p-4 gap-2 relative h-[var(--card-header-height)]",
  navigationButton: "h-7 w-7 p-0",
  dateTitle: "text-lg flex items-center gap-2 whitespace-nowrap",
  sectionTitle: "text-xs font-medium text-muted-foreground",

  allDayEvent:
    "flex flex-col gap-2 p-2 py-3 pl-3 rounded-lg hover:bg-muted cursor-pointer transition-colors",
  allDayEventTitle: "font-medium",
  allDayEventCalendar: "text-xs text-muted-foreground",

  timedEventsContainer: "space-y-2 pt-2",
  timedEventsList: "relative pl-12 ml-2 border-l-2 border-muted space-y-6",

  timeIndicator: {
    base: "absolute -left-[3.55rem] top-0 flex items-center justify-center w-4 h-4 rounded-full bg-background border border-primary-500",
    current: "border-yellow-300",
    past: "",
    future: "",
  },

  timeIndicatorDot: {
    base: "w-2 h-2 bg-background rounded-full",
    current:
      "bg-yellow-500 border-2 border-yellow-300 text-[hsl(var(--current))] animate-pulse",
    past: "bg-[hsl(var(--past))]",
    future: "bg-[hsl(var(--future))]",
  },

  timeLabel: {
    base: "absolute -left-[2rem] -top-1 w-fit p-0.5 px-1 border bg-white dark:bg-gray-600 rounded-lg text-xs text-right",
    current:
      "bg-yellow-400 border-2 border-yellow-300 text-[hsl(var(--current))]",
    past: "bg-white border text-primary-500 dark:bg-black/50 dark:border-gray-500 dark:text-white",
    future:
      "bg-white border border-primary-500 text-primary-500 dark:bg-primary-100 dark:border-primary-500 dark:text-primary-500",
  },

  eventCard: {
    base: "flex flex-col gap-2 p-2 pb-3 pl-3 ml-0.5 w-full rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
    current: "bg-[hsl(var(--current-bg))]",
    past: "bg-gray-200 dark:bg-gray-800",
    future: "bg-[hsl(var(--future-bg))]",
  },

  eventTitle: {
    base: "font-medium truncate max-w-[16rem]",
    past: "text-gray-500 dark:text-gray-400",
  },

  meetButton: {
    base: "text-xs text-green-500 bg-green-50 font-semibold border-green-500 rounded-xl hover:bg-green-100 hover:border-green-600 hover:text-green-600",
    past: "text-gray-300 bg-gray-400 border-none dark:text-gray-700 dark:bg-gray-600 hover:bg-gray-500 hover:text-white",
  },

  eventDetails: {
    email:
      "text-xs truncate border rounded-lg p-1 px-2 bg-muted text-muted-foreground w-fit",
    text: "text-xs truncate",
    past: "text-gray-500 dark:text-gray-400",
  },
};
