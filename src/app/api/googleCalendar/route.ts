import { getToken } from "next-auth/jwt";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { CalendarInfo } from "@/types/calendar";

export async function GET(request: Request) {
  try {
    // ユーザーごとのアクセストークンをJWTから取得（サーバーサイドで）
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    if (!token || !token.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // OAuth2クライアントを生成
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
    });

    // Calendar API クライアント
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // カレンダー一覧を取得
    const calendarList = await calendar.calendarList.list();
    const primaryCalendar = calendarList.data.items?.find((cal) => cal.primary);
    const calendars: CalendarInfo | null = primaryCalendar
      ? {
          id: primaryCalendar.id || "",
          email: primaryCalendar.summary || "",
          displayName: primaryCalendar.summaryOverride || "",
          color:
            primaryCalendar.backgroundColor && primaryCalendar.foregroundColor
              ? {
                  background: primaryCalendar.backgroundColor,
                  foreground: primaryCalendar.foregroundColor,
                }
              : null,
        }
      : null;

    // console.log(calendars);

    // カレンダーイベントを取得（今日から前後3ヶ月）
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    const sixMonthsLater = new Date(now.setMonth(now.getMonth() + 6)); // +6 because we moved -3 above

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: sixMonthsAgo.toISOString(),
      timeMax: sixMonthsLater.toISOString(),
      maxResults: 1000,
      singleEvents: true,
      orderBy: "startTime",
    });

    return NextResponse.json({
      events: response.data.items,
      calendars: calendars,
      email: token.email as string,
    });
  } catch (error) {
    console.error("[GoogleCalendar API Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
