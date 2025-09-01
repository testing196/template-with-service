"use client"

import { useState } from "react"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AvailabilityCalendarProps {
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  availableDates?: Date[]
  className?: string
}

export function AvailabilityCalendar({
  selectedDate,
  onDateSelect,
  availableDates = [],
  className,
}: AvailabilityCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday start
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const today = startOfDay(new Date())

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7))
  }

  const isDateAvailable = (date: Date) => {
    return availableDates.some((availableDate) => isSameDay(availableDate, date))
  }

  const isDateSelectable = (date: Date) => {
    return !isBefore(date, today) && isDateAvailable(date)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Select Date</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              disabled={isBefore(addDays(weekStart, -1), today)}
            >
              ←
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Date buttons */}
          {weekDays.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isCurrentDay = isToday(date)
            const isSelectable = isDateSelectable(date)
            const isPast = isBefore(date, today)

            return (
              <Button
                key={date.toISOString()}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-10 w-full p-0 font-normal",
                  isCurrentDay && !isSelected && "bg-accent text-accent-foreground",
                  !isSelectable && "opacity-50 cursor-not-allowed",
                  isPast && "text-muted-foreground",
                  isSelectable && !isSelected && "hover:bg-accent hover:text-accent-foreground",
                )}
                disabled={!isSelectable}
                onClick={() => isSelectable && onDateSelect(date)}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm">{format(date, "d")}</span>
                  {isDateAvailable(date) && !isPast && <div className="w-1 h-1 bg-primary rounded-full mt-1" />}
                </div>
              </Button>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-muted rounded-full" />
            <span>Unavailable</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
