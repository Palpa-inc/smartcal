import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/types/calendar";
import { formatDateOnly, formatTime } from "@/lib/utils";
import { VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDialog({ event, isOpen, onClose }: EventDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-left">{event.summary}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[75svh] overflow-y-auto">
          <div>
            <p className="text-sm text-muted-foreground">
              {event.start.date
                ? formatDateOnly(event.start.date)
                : `${formatDateOnly(event.start.dateTime!)} ${formatTime(
                    event.start.dateTime!
                  )} - ${formatTime(event.end.dateTime!)}`}
            </p>
          </div>

          {event.hangoutLink && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (event.hangoutLink) {
                    window.open(event.hangoutLink, "_blank");
                  }
                }}
              >
                <VideoIcon className="h-4 w-4 mr-2" />
                ミーティングに参加
              </Button>
            </div>
          )}
          {event.attendees && event.attendees.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">参加者</h4>
              <div className="flex flex-wrap gap-2 pb-2">
                {event.attendees.map((attendee) => (
                  <Badge
                    key={attendee.email}
                    variant="secondary"
                    className="flex items-center gap-1 max-w-[300px] cursor-pointer"
                  >
                    <span className="truncate">
                      {attendee.displayName || attendee.email}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {event.description && (
            <div className="p-4 border rounded-md bg-muted h-fit">
              <div className="whitespace-pre-wrap break-words break-all">
                <p className="text-sm">{event.description}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
