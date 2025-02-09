import { Calendars } from "./side-menu/calendars";
import { Keywords } from "./side-menu/keywords";
import { Calendar } from "../calendar/base-calendar";

interface SidebarProps {
  openSidebar: boolean;
  Close?: () => void;
}

const SidebarContent = () => (
  <nav className="space-y-4">
    <Calendars />
    <Keywords />
    <Calendar instanceId="sidebar" />
  </nav>
);

export const Sidebar = ({ openSidebar, Close }: SidebarProps) => {
  return (
    <>
      {/* デスクトップ表示 */}
      <aside className="hidden md:block w-72 bg-white dark:bg-background border-r border-gray-200 dark:border-gray-700 p-4">
        <SidebarContent />
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
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-background border-r border-gray-200 dark:border-gray-700 p-4 transform transition-transform duration-300 ease-in-out md:hidden ${
            openSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
        </aside>
      </>
    </>
  );
};
