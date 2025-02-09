"use client";
import { useState } from "react";
import { Calendars } from "./side-menu/calendars";
import { Keywords } from "./side-menu/keywords";
import { Calendar } from "../calendar/base-calendar";
import { Button } from "../ui/button";
import { CalendarPlus, CalendarClock } from "lucide-react";
import { CreateEventDialog } from "../event/create-event";

interface SidebarProps {
  openSidebar: boolean;
  Close?: () => void;
}

const SidebarContent = ({
  handleCreateEventClick,
  instanceId,
}: {
  handleCreateEventClick: (isTantitive: boolean) => void;
  instanceId: string;
}) => (
  <nav className="space-y-4">
    <Calendars />
    <Keywords />
    <Calendar instanceId={instanceId} />
    <div className="flex flex-col gap-3">
      <Button onClick={() => handleCreateEventClick(false)}>
        <CalendarPlus className="h-4 w-4 mr-1" />
        予定を作成
      </Button>
      <Button variant="outline" onClick={() => handleCreateEventClick(true)}>
        <CalendarClock className="h-4 w-4 mr-1" />
        候補日を仮押さえ
      </Button>
    </div>
    {/* <EventList /> */}
  </nav>
);

export const Sidebar = ({ openSidebar, Close }: SidebarProps) => {
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [isTantitive, setIsTantitive] = useState(false);
  const handleCreateEventClick = (isTantitive: boolean) => {
    setCreateEventDialogOpen(true);
    setIsTantitive(isTantitive);
  };
  return (
    <>
      {/* デスクトップ表示 */}
      <aside className="hidden md:block w-64 min-w-64 bg-white dark:bg-background border-r border-gray-200 dark:border-gray-700 p-4 z-30">
        <SidebarContent
          handleCreateEventClick={handleCreateEventClick}
          instanceId="desktop-sidebar"
        />
      </aside>

      {/* モバイル表示 */}
      <>
        {/* オーバーレイ */}
        {openSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={Close}
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 min-w-64 bg-white dark:bg-background border-r border-gray-200 dark:border-gray-700 p-4 transform transition-transform duration-300 ease-in-out md:hidden ${
            openSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent
            handleCreateEventClick={handleCreateEventClick}
            instanceId="mobile-sidebar"
          />
        </aside>
      </>
      <CreateEventDialog
        isOpen={createEventDialogOpen}
        onClose={() => setCreateEventDialogOpen(false)}
        isTantitive={isTantitive}
      />
    </>
  );
};
