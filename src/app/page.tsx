"use client";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Calendar } from "@/components/calendar/base-calendar";
import { EventList } from "@/components/calendar/base-event";
import { useState } from "react";

export default function Home() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    // カレンダーコンテキスト
    <CalendarProvider>
      {/* メインコンテンツ */}
      <div className="min-h-screen flex flex-col">
        {/* ヘッダー */}
        <Header Open={() => setOpenSidebar(true)} />
        {/* レイアウト */}
        <div className="flex flex-1">
          {/* サイドバー */}
          <Sidebar
            openSidebar={openSidebar}
            Close={() => setOpenSidebar(false)}
          />
          {/* メインコンテンツ */}
          <main className="flex flex-col flex-1 bg-transparent p-6 gap-4 overflow-y-auto">
            <Calendar instanceId="main" />
            <EventList />
          </main>
        </div>
      </div>
    </CalendarProvider>
  );
}
