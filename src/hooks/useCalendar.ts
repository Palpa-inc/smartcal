import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarEvent,
  CalendarInfo,
  CalendarDataByEmail,
} from "@/types/calendar";
import { toJSTDate } from "@/lib/utils";
import {
  getCalendarDataFromFirestore,
  saveCalendarDataToFirestore,
  subscribeToCalendarUpdates,
  isDataStale,
} from "@/lib/firebase/calendar";
import { useAuth } from "./useAuth";
import { useSession } from "next-auth/react";

export function useGoogleCalendar(userId: string) {
  const { data: session } = useSession();
  const { userData } = useAuth();
  const [date, setDate] = useState<Date>(toJSTDate());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<CalendarDataByEmail>({});
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);

  const allEvents = Object.entries(accounts)
    .filter(([email]) =>
      calendars.some((calendar) => calendar.email === email && calendar.isShown)
    )
    .flatMap(([email, account]) =>
      account.events
        .map((event) => ({
          ...event,
          parentEmail: email, // 各イベントにメールアドレスを追加
        }))
        .filter(
          (event) =>
            !userData?.hideKeywords.includes(event.summary) &&
            !userData?.hideKeywords.includes(event.description || "")
        )
    );

  console.log("allEvents", allEvents);

  // カレンダーのデータを更新
  const refreshCalendarData = async (selectedCalendars: CalendarInfo) => {
    if (!userId) {
      setError("ユーザーIDが見つかりません");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (selectedCalendars) {
        const { data } = await axios.get<{
          email: string;
          events: CalendarEvent[];
        }>("/api/googleCalendar/" + selectedCalendars.id);

        await saveCalendarDataToFirestore(userId, data.email, {
          events: data.events,
          calendarInfo: selectedCalendars,
          lastUpdated: new Date(),
        });

        return;
      } else {
        // 全ての連携済みアカウントの予定を取得
        const { data } = await axios.get<{
          email: string;
          events: CalendarEvent[];
          calendars: CalendarInfo;
        }>("/api/googleCalendar");

        // 各アカウントのデータを保存
        await saveCalendarDataToFirestore(userId, data.email, {
          events: data.events,
          calendarInfo: data.calendars,
          lastUpdated: new Date(),
        });
      }
      // 保存したデータを取得
      const firestoreData = await getCalendarDataFromFirestore(userId);

      setAccounts(firestoreData);
    } catch (err) {
      console.error("Error in refreshCalendarData:", err);
      setError(
        err instanceof Error ? err.message : "カレンダーの更新に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  // カレンダーの表示/非表示を切り替える
  const handleToggleCalendar = (email: string) => {
    setCalendars((prevCalendars) =>
      prevCalendars.map((calendar) =>
        calendar.email === email
          ? { ...calendar, isShown: !calendar.isShown }
          : calendar
      )
    );
  };
  // カレンダーのデータを読み込む
  useEffect(() => {
    const loadInitialData = async () => {
      if (!session?.user.email) return;

      try {
        setLoading(true);
        const data = await getCalendarDataFromFirestore(userId);

        const staleEmails = !data
          ? []
          : Object.keys(data).filter(
              (email) =>
                !data[email].lastUpdated || isDataStale(data[email].lastUpdated)
            );

        if (!data || staleEmails.length > 0) {
          // 古いデータを持つメールアドレスのみ更新
          for (const email of staleEmails) {
            if (email === session?.user.email) {
              await refreshCalendarData(data[email].calendars);
              return;
            } else {
              console.log(
                "not session account. current account",
                session?.user.email
              );
            }
          }
        }

        setAccounts(data);

        // forEach を使う代わりに、一度にすべてのカレンダーを設定
        const allCalendars = Object.entries(data).map(
          ([email, accountData]) => {
            return {
              ...accountData.calendars,
              email: email, // emailを明示的に上書き
              id: email,
              isShown: true,
            };
          }
        );
        setCalendars(allCalendars);
        setLoading(false);
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError(
          err instanceof Error ? err.message : "データの読み込みに失敗しました"
        );
        setLoading(false);
      }
    };

    loadInitialData();
  }, [userId, session]);

  // カレンダーのデータをリアルタイムで更新
  useEffect(() => {
    if (userId) {
      subscribeToCalendarUpdates(userId, (calendarData) => {
        setAccounts(calendarData);
      });
    }
  }, [userId]);

  return {
    allEvents,
    calendars,
    loading,
    error,
    date,
    setDate,
    refreshCalendarData,
    handleToggleCalendar,
  };
}
