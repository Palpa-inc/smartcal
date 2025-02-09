"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewCalendarEvent } from "@/types/calendar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AttendeeSelect } from "@/components/event/select-attendee";
import { useForm } from "react-hook-form";
import { useCalendar } from "@/contexts/CalendarContext";

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isTantitive?: boolean;
  //   onCreateEvent: (event: NewCalendarEvent) => Promise<boolean>;
}

interface Attendee {
  email: string;
  displayName?: string;
}

interface ParsedDate {
  date: Date;
  startTime: string;
  endTime: string;
}

interface FormValues {
  title: string;
  description: string;
  calendarId: string;
  startTime: string;
  endTime: string;
}

export function CreateEventDialog({
  isOpen,
  onClose,
  isTantitive = false,
}: //   onCreateEvent,
CreateEventDialogProps) {
  const { calendars, allEvents: events, date } = useCalendar();
  const [isCreating, setIsCreating] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const [dateText, setDateText] = useState("");
  const [parsedDates, setParsedDates] = useState<ParsedDate[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      calendarId: "",
      startTime: "09:00",
      endTime: "10:00",
    },
  });

  const selectedCalendar = watch("calendarId");

  const suggestedAttendees = useMemo(() => {
    if (!selectedCalendar) return [];

    const attendeeSet = new Set<string>();
    events
      .filter(
        (event) => event.calendarId === selectedCalendar && event.attendees
      )
      .forEach((event) => {
        event.attendees?.forEach((attendee: Attendee) => {
          attendeeSet.add(
            JSON.stringify({
              email: attendee.email,
              displayName: attendee.displayName || attendee.email,
            })
          );
        });
      });

    return Array.from(attendeeSet).map((str) => JSON.parse(str));
  }, [selectedCalendar, events]);

  const addAttendee = (attendee: Attendee) => {
    if (!attendees.some((a) => a.email === attendee.email)) {
      setAttendees([...attendees, attendee]);
    }
  };

  const removeAttendee = (email: string) => {
    setAttendees(attendees.filter((a) => a.email !== email));
  };

  const onSubmit = async (data: FormValues) => {
    if (!date) return;

    const [startHour, startMinute] = data.startTime.split(":").map(Number);
    const [endHour, endMinute] = data.endTime.split(":").map(Number);

    const start = new Date(date);
    start.setHours(startHour, startMinute, 0);

    const end = new Date(date);
    end.setHours(endHour, endMinute, 0);

    const newEvent: NewCalendarEvent = {
      summary: data.title,
      description: data.description,
      start: {
        dateTime: start.toISOString(),
        timeZone: "Asia/Tokyo",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "Asia/Tokyo",
      },
      calendarId: data.calendarId,
      attendees: attendees.map((a) => ({ email: a.email })),
    };

    // const success = await onCreateEvent(newEvent);
    // if (success) {
    //   onClose();
    //   reset();
    //   setAttendees([]);
    // }
  };

  // 日付テキストをパースする関数
  const parseDates = (text: string): ParsedDate[] => {
    const dates: ParsedDate[] = [];
    const lines = text
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/^[-・]/, "")
          .trim()
      )
      .filter((line) => line);

    for (const line of lines) {
      const dateMatch = line.match(
        /(\d+)\/(\d+)(?:\s*\([月火水木金土日]\))?\s*/
      );
      if (!dateMatch) continue;

      const month = parseInt(dateMatch[1]);
      const day = parseInt(dateMatch[2]);

      const date = new Date();
      // 指定された月が現在の月より前の場合は来年の日付として扱う
      if (month < date.getMonth() + 1) {
        date.setFullYear(date.getFullYear() + 1);
      }
      date.setMonth(month - 1);
      date.setDate(day);
      date.setHours(0, 0, 0, 0);

      // 時間帯を含む部分を抽出
      const timeRangesText = line.slice(dateMatch[0].length);
      // カンマまたはスラッシュで時間帯を分割
      const timeRanges = timeRangesText
        .split(/[\/,、]/)
        .map((range) => range.trim());

      for (const range of timeRanges) {
        // より柔軟な時間形式に対応
        const timeMatch = range.match(
          /(\d{1,2}:\d{2})\s*[-~～]\s*(\d{1,2}:\d{2})/
        );
        if (!timeMatch) continue;

        const [, start, end] = timeMatch;
        dates.push({
          date: new Date(date.getTime()),
          startTime: start,
          endTime: end,
        });
      }
    }

    return dates;
  };

  // ParsedDateの表示用に日付をフォーマットする関数を追加
  const formatParsedDate = (date: Date, startTime: string, endTime: string) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    return `${month}/${day}(${weekDay}) ${startTime}~${endTime}`;
  };

  const handleTextChange = (text: string) => {
    setDateText(text);
    setParsedDates(parseDates(text));
  };

  const removeParsedDate = (indexToRemove: number) => {
    const newDates = parsedDates.filter((_, index) => index !== indexToRemove);
    setParsedDates(newDates);

    // テキストエリアの内容も更新
    const newText = newDates
      .map(({ date, startTime, endTime }) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day} ${startTime}~${endTime}`;
      })
      .join("\n");
    setDateText(newText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isTantitive ? "仮押さえ候補日を作成" : "予定を作成"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">タイトル</label>
            <Input
              {...register("title", { required: true })}
              placeholder="予定のタイトル"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">カレンダー</label>
            <Select
              value={selectedCalendar}
              onValueChange={(value) => {
                register("calendarId").onChange({ target: { value } });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="カレンダーを選択">
                  {selectedCalendar && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            calendars.find((cal) => cal.id === selectedCalendar)
                              ?.color?.background || "#039BE5",
                        }}
                      />
                      {calendars.find((cal) => cal.id === selectedCalendar)
                        ?.displayName ||
                        calendars.find((cal) => cal.id === selectedCalendar)
                          ?.displayName ||
                        calendars.find((cal) => cal.id === selectedCalendar)
                          ?.email}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {calendars
                  .filter((cal) => cal.isShown)
                  .map((calendar) => (
                    <SelectItem
                      key={calendar.id}
                      value={calendar.id}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              calendar.color?.background || "#039BE5",
                          }}
                        />
                        {calendar.displayName || calendar.email}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {isTantitive ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">候補日</label>
                <Textarea
                  value={dateText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={`7/19(金) 10:00 ~ 18:00
7/20(土) 10:00 ~ 11:00 / 12:00 ~ 13:00, 15:00 ~ 16:00`}
                  className="min-h-[70px]"
                />
                <p className="text-xs text-muted-foreground">
                  1行に1日分の候補を入力してください。
                  <br />
                  同じ日に複数の時間帯がある場合は / または ,
                  で区切ってください。
                </p>
                {dateText && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {parsedDates.map((parsed, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                      >
                        <span>
                          {formatParsedDate(
                            parsed.date,
                            parsed.startTime,
                            parsed.endTime
                          )}
                        </span>
                        <button
                          onClick={() => removeParsedDate(index)}
                          className="ml-1 text-destructive transition-opacity duration-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {dateText && parsedDates.length === 0 && (
                  <p className="text-xs text-destructive">
                    有効な候補日が見つかりません。入力形式を確認してください。
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">開始時間</label>
                  <Input type="time" {...register("startTime")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">終了時間</label>
                  <Input type="time" {...register("endTime")} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">メモ</label>
                <Textarea
                  {...register("description")}
                  placeholder="予定の詳細"
                />
              </div>
            </>
          )}
          <AttendeeSelect
            attendees={attendees}
            suggestedAttendees={suggestedAttendees}
            onAddAttendee={addAttendee}
            onRemoveAttendee={removeAttendee}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <LoadingSpinner />
                  作成中
                </>
              ) : (
                "作成"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
