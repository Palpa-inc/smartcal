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

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDialog({ event, isOpen, onClose }: EventDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.summary}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {event.start.date
                ? formatDateOnly(event.start.date)
                : `${formatDateOnly(event.start.dateTime!)} ${formatTime(
                    event.start.dateTime!
                  )} - ${formatTime(event.end.dateTime!)}`}
            </p>
          </div>
          {event.description && (
            <div>
              <p className="text-sm whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
          {event.meetLink && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (event.meetLink) {
                    window.open(event.meetLink, "_blank");
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
              <div className="space-y-1">
                {event.attendees.map((attendee) => (
                  <p key={attendee.email} className="text-sm">
                    {attendee.displayName || attendee.email}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
