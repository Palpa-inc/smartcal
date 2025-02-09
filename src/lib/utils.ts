import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeStatus(startTime: string, endTime: string) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return "future";
  if (now > end) return "past";
  return "current";
}

export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export const formatDateOnly = (date: Date | string) => {
  const d = new Date(date);
  const jstDate = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return `${jstDate.getMonth() + 1}月${jstDate.getDate()}日 (${
    ["日", "月", "火", "水", "木", "金", "土"][jstDate.getDay()]
  })`;
};

export function toJSTDate(date: Date = new Date()): Date {
  // UTCの日付をJST（UTC+9）に変換
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  jstDate.setHours(0, 0, 0, 0);
  return jstDate;
}
