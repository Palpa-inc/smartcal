// カレンダーイベントの型定義
export interface CalendarEvent {
  id: string; // イベントの一意のID
  summary: string; // イベントのタイトル
  description?: string; // イベントの説明
  hangoutLink?: string | null; // Google Meetのリンク
  start: {
    // 開始日時
    dateTime?: string;
    timeZone?: string;
    date?: string;
  };
  end: {
    // 終了日時
    dateTime?: string;
    timeZone?: string;
    date?: string;
  };
  calendarId?: string; // カレンダーのID
  calendarSummary?: string; // カレンダーの表示名
  parentEmail?: string; // カレンダーのメールアドレス
  meetLink?: string | null; // 会議リンク
  attendees?: {
    // 参加者情報
    email: string;
    displayName?: string;
  }[];
}

// カレンダー情報の型定義
export interface CalendarInfo {
  id: string; // カレンダーのID
  email: string; // カレンダーのメールアドレス
  displayName?: string | null; // カスタム表示名
  color?: {
    // カレンダーの色設定
    background: string;
    foreground: string;
  } | null;
  isShown?: boolean;
}

export interface CalendarDataByEmail {
  [email: string]: {
    events: CalendarEvent[];
    calendars: CalendarInfo;
    lastUpdated: Date;
  };
}
