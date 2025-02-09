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
import { toJSTDate } from "@/lib/utils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isTantitive?: boolean;
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
  date: string;
  startTime: string;
  endTime: string;
  attendees: Attendee[];
}

export function CreateEventDialog({
  isOpen,
  onClose,
  isTantitive = false,
}: CreateEventDialogProps) {
  const { calendars, allEvents: events, date, onCreateEvent } = useCalendar();
  const [isCreating, setIsCreating] = useState(false);

  const [dateText, setDateText] = useState("");
  const [parsedDates, setParsedDates] = useState<ParsedDate[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: {},
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      calendarId: "",
      date: date ? toJSTDate(date).toISOString().split("T")[0] : "",
      startTime: date ? toJSTDate(date).toISOString().split("T")[1] : "",
      endTime: date ? toJSTDate(date).toISOString().split("T")[1] : "",
      attendees: [],
    },
  });

  const suggestedAttendees = useMemo(() => {
    if (!watch("calendarId")) return [];

    const attendeeSet = new Set<string>();

    events
      .filter(
        (event) => event.parentEmail === watch("calendarId") && event.attendees
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
  }, [watch("calendarId"), events]);

  const addAttendee = (attendee: Attendee) => {
    setValue("attendees", [...watch("attendees"), attendee]);
  };

  const removeAttendee = (email: string) => {
    setValue(
      "attendees",
      watch("attendees").filter((a: Attendee) => a.email !== email)
    );
  };

  const onSubmit = async (data: FormValues) => {
    setIsCreating(true);
    const [startHour, startMinute] = data.startTime.split(":").map(Number);
    const [endHour, endMinute] = data.endTime.split(":").map(Number);

    const start = new Date(data.date);
    start.setHours(startHour, startMinute, 0);

    const end = new Date(data.date);
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
      attendees: watch("attendees").map((a: Attendee) => ({
        email: a.email,
      })),
    };

    const success = await onCreateEvent(newEvent);
    if (success) {
      onClose();
      reset();
    }
    setIsCreating(false);
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 py-4 px-2 max-h-[70svh] overflow-y-auto"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">タイトル</label>
            <Input
              {...register("title", { required: true })}
              placeholder="予定のタイトル"
              className="dark:border-gray-400 dark:bg-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">カレンダー</label>
            <Select
              value={watch("calendarId")}
              onValueChange={(value) => {
                setValue("calendarId", value);
              }}
            >
              <SelectTrigger className="dark:border-gray-400 dark:bg-gray-900">
                <SelectValue placeholder="カレンダーを選択">
                  {watch("calendarId") ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            calendars.find(
                              (cal) => cal.id === watch("calendarId")
                            )?.color?.background || "#039BE5",
                        }}
                      />
                      {calendars.find((cal) => cal.id === watch("calendarId"))
                        ?.displayName ||
                        calendars.find((cal) => cal.id === watch("calendarId"))
                          ?.email}
                    </div>
                  ) : (
                    "カレンダーを選択"
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
                  className="min-h-[70px] dark:border-gray-400 dark:bg-gray-900"
                />
                <p className="text-xs text-muted-foreground">
                  1行に1日分の候補を入力してください。
                  <br />
                  同じ日に複数の時間帯がある場合は / または ,
                  で区切ってください。
                </p>
                {dateText && (
                  <div className="flex flex-wrap gap-2 ">
                    {parsedDates.map((parsed, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary/10 dark:bg-blue-500 text-primary border border-primary/20"
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
                          className="ml-1 text-destructive dark:text-white  transition-opacity duration-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {dateText && parsedDates.length === 0 && (
                  <p className="text-xs text-destructive dark:text-red-400">
                    有効な候補日が見つかりません。入力形式を確認してください。
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">日付</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal dark:border-gray-400 dark:bg-gray-900",
                        !watch("date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("date") ? (
                        format(new Date(watch("date")), "PPP", { locale: ja })
                      ) : (
                        <span>日付を選択</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        watch("date") ? new Date(watch("date")) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          // 日付のみを取得し、時間を09:00:00に設定することで
                          // 確実に日本時間の当日として扱われるようにする
                          const jstDate = new Date(date);
                          jstDate.setHours(9, 0, 0, 0);
                          setValue("date", jstDate.toISOString().split("T")[0]);
                        } else {
                          setValue("date", "");
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">開始時間</label>
                  <Input
                    type="time"
                    {...register("startTime")}
                    className="dark:border-gray-400 dark:bg-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">終了時間</label>
                  <Input
                    type="time"
                    {...register("endTime")}
                    className="dark:border-gray-400 dark:bg-gray-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">メモ</label>
                <Textarea
                  {...register("description")}
                  placeholder="予定の詳細"
                  className="dark:border-gray-400 dark:bg-gray-900"
                />
              </div>
            </>
          )}
          <AttendeeSelect
            attendees={watch("attendees")}
            suggestedAttendees={suggestedAttendees}
            onAddAttendee={addAttendee}
            onRemoveAttendee={removeAttendee}
          />
          <DialogFooter className="flex gap-2">
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
