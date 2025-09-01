import { addMinutes, startOfDay, isAfter, isBefore, addDays } from "date-fns"
import type { Service, AvailabilityRule, Blackout, Booking, TimeSlot } from "../types"
import { parseTimeString, isDateInRange } from "./date-utils"
import { BOOKING_CONFIG } from "../constants"

interface GenerateSlotsOptions {
  service: Service
  availabilityRules: AvailabilityRule[]
  blackouts: Blackout[]
  existingBookings: Booking[]
  startDate: Date
  endDate: Date
  timezone: string
}

export function generateAvailableSlots({
  service,
  availabilityRules,
  blackouts,
  existingBookings,
  startDate,
  endDate,
  timezone,
}: GenerateSlotsOptions): TimeSlot[] {
  const slots: TimeSlot[] = []
  const now = new Date()
  const minBookingTime = addMinutes(now, BOOKING_CONFIG.minLeadTimeHours * 60)

  // Generate slots for each day in the range
  let currentDate = startOfDay(startDate)
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()

    // Find availability rules for this day and service
    const dayRules = availabilityRules.filter(
      (rule) => rule.serviceId === service.id && rule.dayOfWeek === dayOfWeek && rule.isActive,
    )

    // Generate slots for each availability rule
    for (const rule of dayRules) {
      const ruleStartTime = parseTimeString(rule.startTime, currentDate, timezone)
      const ruleEndTime = parseTimeString(rule.endTime, currentDate, timezone)

      // Generate time slots within this rule's window
      let slotStart = ruleStartTime
      while (addMinutes(slotStart, service.duration) <= ruleEndTime) {
        const slotEnd = addMinutes(slotStart, service.duration)

        // Check if slot meets minimum lead time
        if (isAfter(slotStart, minBookingTime)) {
          const isAvailable = isSlotAvailable(slotStart, slotEnd, service.id, blackouts, existingBookings)

          slots.push({
            startTime: slotStart,
            endTime: slotEnd,
            isAvailable,
          })
        }

        // Move to next slot (typically 30-minute intervals)
        slotStart = addMinutes(slotStart, 30)
      }
    }

    currentDate = addDays(currentDate, 1)
  }

  return slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}

function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  serviceId: string,
  blackouts: Blackout[],
  existingBookings: Booking[],
): boolean {
  // Check blackouts
  const relevantBlackouts = blackouts.filter(
    (blackout) => blackout.isActive && (blackout.serviceId === null || blackout.serviceId === serviceId),
  )

  for (const blackout of relevantBlackouts) {
    if (
      isDateInRange(slotStart, blackout.startDate, blackout.endDate) ||
      isDateInRange(slotEnd, blackout.startDate, blackout.endDate)
    ) {
      return false
    }
  }

  // Check existing bookings
  const conflictingBookings = existingBookings.filter(
    (booking) =>
      booking.serviceId === serviceId &&
      booking.status !== "CANCELLED" &&
      (isDateInRange(slotStart, booking.startTime, booking.endTime) ||
        isDateInRange(slotEnd, booking.startTime, booking.endTime) ||
        (isBefore(slotStart, booking.startTime) && isAfter(slotEnd, booking.endTime))),
  )

  return conflictingBookings.length === 0
}

export function holdTimeSlot(slot: TimeSlot): TimeSlot {
  return {
    ...slot,
    isHeld: true,
    holdExpiresAt: addMinutes(new Date(), BOOKING_CONFIG.holdDurationMinutes),
  }
}

export function releaseExpiredHolds(slots: TimeSlot[]): TimeSlot[] {
  const now = new Date()
  return slots.map((slot) => {
    if (slot.isHeld && slot.holdExpiresAt && isAfter(now, slot.holdExpiresAt)) {
      return {
        ...slot,
        isHeld: false,
        holdExpiresAt: undefined,
      }
    }
    return slot
  })
}
