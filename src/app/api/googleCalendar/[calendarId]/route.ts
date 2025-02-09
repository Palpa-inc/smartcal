import { getToken } from "next-auth/jwt";
import { google } from "googleapis";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{
    calendarId: string;
  }>;
}

export async function GET(request: Request, { params }: Props) {
  const { calendarId } = await params;
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

    // カレンダーイベントを取得（今日から前後3ヶ月）
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 2));
    const sixMonthsLater = new Date(now.setMonth(now.getMonth() + 4));

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: sixMonthsAgo.toISOString(),
      timeMax: sixMonthsLater.toISOString(),
      maxResults: 500,
      singleEvents: true,
      orderBy: "startTime",
    });

    return NextResponse.json({
      events: response.data.items,
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
