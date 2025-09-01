"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { TimeSlot } from "@/lib/types"

interface TimeSlotPickerProps {
  selectedDate: Date
  timeSlots: TimeSlot[]
  selectedSlot?: TimeSlot
  onSlotSelect: (slot: TimeSlot) => void
  className?: string
}

export function TimeSlotPicker({
  selectedDate,
  timeSlots,
  selectedSlot,
  onSlotSelect,
  className,
}: TimeSlotPickerProps) {
  const availableSlots = timeSlots.filter((slot) => slot.isAvailable && !slot.isHeld)
  const heldSlots = timeSlots.filter((slot) => slot.isHeld)

  const formatTimeSlot = (slot: TimeSlot) => {
    return `${format(slot.startTime, "h:mm a")} - ${format(slot.endTime, "h:mm a")}`
  }

  if (timeSlots.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Available Times</CardTitle>
          <p className="text-sm text-muted-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No available time slots for this date.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please select a different date or contact us for custom scheduling.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Available Times</CardTitle>
        <p className="text-sm text-muted-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
      </CardHeader>
      <CardContent>
        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableSlots.map((slot, index) => {
              const isSelected = selectedSlot && slot.startTime.getTime() === selectedSlot.startTime.getTime()

              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn("h-auto py-3 px-4 text-sm", isSelected && "ring-2 ring-primary ring-offset-2")}
                  onClick={() => onSlotSelect(slot)}
                >
                  {format(slot.startTime, "h:mm a")}
                </Button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No available time slots for this date.</p>
            <p className="text-sm text-muted-foreground mt-2">Please select a different date.</p>
          </div>
        )}

        {heldSlots.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                Temporarily Held
              </Badge>
              <span className="text-xs text-muted-foreground">These slots are being held by other users</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {heldSlots.map((slot, index) => (
                <Button
                  key={`held-${index}`}
                  variant="ghost"
                  size="sm"
                  className="h-auto py-3 px-4 text-sm opacity-50 cursor-not-allowed"
                  disabled
                >
                  {format(slot.startTime, "h:mm a")}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
