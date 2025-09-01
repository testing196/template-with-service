import { format, addMinutes, startOfDay, isWithinInterval } from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"

export function formatDate(date: Date, formatStr = "PPP"): string {
  return format(date, formatStr)
}

export function formatTime(date: Date, formatStr = "p"): string {
  return format(date, formatStr)
}

export function formatDateTime(date: Date, formatStr = "PPP p"): string {
  return format(date, formatStr)
}

export function toTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone)
}

export function fromTimezone(date: Date, timezone: string): Date {
  return fromZonedTime(date, timezone)
}

export function parseTimeString(timeStr: string, date: Date, timezone: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const baseDate = startOfDay(toTimezone(date, timezone))
  const timeInTz = addMinutes(baseDate, hours * 60 + minutes)
  return fromTimezone(timeInTz, timezone)
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, { start, end })
}

export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let addedDays = 0

  while (addedDays < days) {
    result.setDate(result.getDate() + 1)
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++
    }
  }

  return result
}
