"use client";

import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface Attendee {
  email: string;
  displayName?: string;
}

interface AttendeeSelectProps {
  attendees: Attendee[];
  suggestedAttendees: Attendee[];
  onAddAttendee: (attendee: Attendee) => void;
  onRemoveAttendee: (email: string) => void;
}

export function AttendeeSelect({
  attendees,
  suggestedAttendees,
  onAddAttendee,
  onRemoveAttendee,
}: AttendeeSelectProps) {
  const [attendeeInput, setAttendeeInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">出席者</label>
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          value={attendeeInput}
          onValueChange={setAttendeeInput}
          placeholder="メールアドレスを入力または選択"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isFocused && (
          <CommandList>
            {suggestedAttendees
              .filter(
                (a) =>
                  !attendees.some((selected) => selected.email === a.email) &&
                  (a.email.includes(attendeeInput) ||
                    a.displayName?.includes(attendeeInput))
              )
              .map((attendee) => (
                <CommandItem
                  key={attendee.email}
                  onSelect={() => {
                    onAddAttendee(attendee);
                    setAttendeeInput("");
                    setIsFocused(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {attendee.displayName || attendee.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {attendee.displayName ? `(${attendee.email})` : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
          </CommandList>
        )}
      </Command>

      <div className="flex flex-wrap gap-2 pt-2">
        {attendees.map((attendee) => (
          <Badge
            key={attendee.email}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {attendee.displayName || attendee.email}
            <button
              onClick={() => onRemoveAttendee(attendee.email)}
              className="ml-1 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
