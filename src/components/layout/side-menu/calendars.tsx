"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/others/color-picker";
import { CommonCard } from "./common";
import { CalendarIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useCalendar } from "@/contexts/CalendarContext";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarInfo } from "@/types/calendar";
import {
  updateCalendarColorInFirestore,
  updateCalendarDisplayNameInFirestore,
} from "@/lib/firebase/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const Calendars = () => {
  const { userData, calendars, refreshCalendarData, handleToggleCalendar } =
    useCalendar();
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingDisplayName, setEditingDisplayName] = useState("");
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarInfo | null>(
    null
  );

  const handleSync = async (calendar: CalendarInfo) => {
    setIsSyncing(true);
    if (!userData?.uid) return;
    if (userData.email !== calendar.email) {
      console.log("not current user", userData.email, calendar.email);
      signIn("google");
      return;
    }

    try {
      refreshCalendarData(calendar);
    } catch (error) {
      console.error("Failed to sync calendars:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateDisplayName = async (
    calendar: CalendarInfo,
    newDisplayName: string
  ) => {
    if (!userData?.uid) return;
    try {
      await updateCalendarDisplayNameInFirestore(
        userData.uid,
        calendar.email,
        newDisplayName
      );
      setSelectedCalendar(null);
    } catch (error) {
      console.error("Failed to update display name:", error);
    }
  };

  return (
    <CommonCard
      title="連携カレンダー"
      icon={<CalendarIcon className="h-4 w-4" />}
      toggle={() => setIsCalendarOpen(!isCalendarOpen)}
      isOpen={isCalendarOpen}
    >
      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-4">
              {calendars.length > 0 && (
                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  {calendars.map((calendar) => (
                    <div
                      key={calendar.email}
                      className="flex flex-row items-center justify-start w-full gap-2"
                    >
                      <Checkbox
                        checked={calendar.isShown}
                        onCheckedChange={() =>
                          handleToggleCalendar(calendar.email)
                        }
                      />
                      <ColorPicker
                        value={
                          calendar.color || {
                            background: "#039BE5",
                            foreground: "#FFFFFF",
                          }
                        }
                        onChange={(color) =>
                          updateCalendarColorInFirestore(
                            userData?.uid as string,
                            calendar.email,
                            calendar.id,
                            color
                          )
                        }
                      />

                      <Dialog
                        open={selectedCalendar?.email === calendar.email}
                        onOpenChange={(open) => {
                          if (!open) setSelectedCalendar(null);
                          if (open) {
                            setSelectedCalendar(calendar);
                            setEditingDisplayName(
                              calendar.displayName || calendar.email
                            );
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <div className="truncate flex-1 cursor-pointer">
                            {calendar.displayName || calendar.email}
                          </div>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>カレンダー名の編集</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-4">
                            <Input
                              value={editingDisplayName}
                              onChange={(e) =>
                                setEditingDisplayName(e.target.value)
                              }
                              placeholder="カレンダー名"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedCalendar(null)}
                              >
                                キャンセル
                              </Button>
                              <Button
                                type="button"
                                onClick={() => {
                                  if (selectedCalendar) {
                                    handleUpdateDisplayName(
                                      selectedCalendar,
                                      editingDisplayName
                                    );
                                  }
                                }}
                              >
                                保存
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full h-2 w-2 p-3 mt-0.5"
                        onClick={() => handleSync(calendar)}
                        disabled={isSyncing}
                      >
                        {isSyncing ? (
                          <Loader2 className="h-0.5 w-0.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-0.5 w-0.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full p-2 rounded-xl"
                onClick={() => {
                  setIsLoading(true);
                  signIn("google");
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-2 w-2 animate-spin" />
                ) : (
                  <Plus className="h-2 w-2" />
                )}
                カレンダーを追加
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CommonCard>
  );
};
