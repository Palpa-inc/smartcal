import { Menu, LogOut, UserPlus, CalendarClock } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCalendar } from "@/contexts/CalendarContext";
import { useAuth } from "@/hooks/useAuth";
import { toJSTDate } from "@/lib/utils";

interface HeaderProps {
  Open: () => void;
}

export const Header = ({ Open }: HeaderProps) => {
  const { user, signOut, signInWithGoogle, isAnonymous } = useAuth();
  const { date, setDate } = useCalendar();
  const isToday = date?.toDateString() === new Date().toDateString();

  const notLoggedInMenuItem = (
    <DropdownMenuItem onClick={signInWithGoogle}>
      <UserPlus className="h-4 w-4 mr-2" />
      Googleログイン
    </DropdownMenuItem>
  );

  const dropdownContent = (
    <>
      {user ? (
        <>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <DropdownMenuItem className="dark:hover:bg-white/50 mb-1">
                <p className="text-sm font-medium leading-none">
                  {isAnonymous ? "匿名ユーザー" : user.email}
                </p>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 dark:bg-white/10" />
              <DropdownMenuItem
                onClick={signOut}
                className="pt-2 dark:hover:bg-white/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                ログアウト
              </DropdownMenuItem>
            </div>
          </DropdownMenuLabel>
        </>
      ) : (
        notLoggedInMenuItem
      )}
    </>
  );

  return (
    <header className="border-b border-gray-200 dark:border-gray-100/50 bg-background sticky top-0 z-40">
      <div className="p-4 px-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={Open}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-extrabold">Timly</h1>
        </div>
        <div className="flex items-center gap-4">
          {!isToday && (
            <Button
              variant="outline"
              onClick={() => {
                setDate(toJSTDate());
              }}
              className="flex items-center gap-1"
            >
              <CalendarClock className="h-4 w-4 mr-1" />
              今日に戻す
            </Button>
          )}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full">
              <UserAvatar imgSrc={user?.photoURL || ""} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-fit p-2 shadow-xl rounded-2xl dark:bg-background dark:border-gray-500"
            >
              {dropdownContent}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
