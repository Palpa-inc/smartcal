import { createContext, useContext, ReactNode } from "react";
import { useGoogleCalendar } from "@/hooks/useCalendar";
import { CalendarEvent, CalendarInfo } from "@/types/calendar";
import { useAuth } from "@/hooks/useAuth";
import { UserData } from "@/types/user";
type CalendarContextType = {
  allEvents: CalendarEvent[];
  calendars: CalendarInfo[];
  loading: boolean;
  error: string | null;
  date: Date;
  setDate: (date: Date) => void;
  refreshCalendarData: (selectedCalendars: CalendarInfo) => void;
  handleToggleCalendar: (email: string) => void;
  userData: UserData | null;
};

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { userData } = useAuth();
  const calendarData = useGoogleCalendar(userData?.uid ?? "");

  return (
    <CalendarContext.Provider value={{ ...calendarData, userData }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
