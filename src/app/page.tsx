"use client";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import TimelineCalendar from "@/components/calendar/timeline-calendar";
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
          <main className="flex flex-col flex-auto bg-transparent p-6 gap-4 overflow-hidden transition-all duration-300">
            <TimelineCalendar />
            {/* <Calendar instanceId="main" /> */}
            {/* <EventList /> */}
          </main>
        </div>
      </div>
    </CalendarProvider>
  );
}
