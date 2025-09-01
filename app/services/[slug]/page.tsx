"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { TimeSlotPicker } from "@/components/time-slot-picker"
import { mockServices, mockAvailabilityRules, mockBlackouts } from "@/lib/data/mock-data"
import { generateAvailableSlots } from "@/lib/utils/slot-generator"
import { addDays, startOfDay } from "date-fns"
import type { TimeSlot } from "@/lib/types"

interface ServiceDetailPageProps {
  params: {
    slug: string
  }
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>()
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])

  // Find the service
  const service = mockServices.find((s) => s.slug === params.slug)

  if (!service) {
    notFound()
  }

  // Generate available dates and slots
  useEffect(() => {
    const startDate = startOfDay(new Date())
    const endDate = addDays(startDate, 30) // Show 30 days ahead

    const slots = generateAvailableSlots({
      service,
      availabilityRules: mockAvailabilityRules,
      blackouts: mockBlackouts,
      existingBookings: [], // TODO: Load from actual bookings
      startDate,
      endDate,
      timezone: "America/New_York",
    })

    // Extract unique dates that have available slots
    const dates = Array.from(
      new Set(slots.filter((slot) => slot.isAvailable).map((slot) => startOfDay(slot.startTime).getTime())),
    ).map((timestamp) => new Date(timestamp))

    setAvailableDates(dates)
  }, [service])

  // Update available slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    const startDate = startOfDay(selectedDate)
    const endDate = addDays(startDate, 1)

    const slots = generateAvailableSlots({
      service,
      availabilityRules: mockAvailabilityRules,
      blackouts: mockBlackouts,
      existingBookings: [], // TODO: Load from actual bookings
      startDate,
      endDate,
      timezone: "America/New_York",
    })

    setAvailableSlots(slots)
    setSelectedSlot(undefined) // Clear selected slot when date changes
  }, [selectedDate, service])

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`
  }

  const formatServiceType = (type: string) => {
    switch (type) {
      case "IN_PERSON":
        return "In-person"
      case "VIRTUAL":
        return "Virtual"
      case "BOTH":
        return "In-person or Virtual"
      default:
        return type
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/services" className="hover:text-foreground transition-colors">
          Services
        </Link>
        <span>→</span>
        <span className="text-foreground">{service.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Service Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">{service.name}</h1>
                <p className="text-xl text-muted-foreground">{service.description}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {formatPrice(service.price)}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{service.duration} minutes</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{formatServiceType(service.type)}</span>
              </div>

              {service.location && (
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{service.location}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* What's Included */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">What's Included</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Personalized consultation tailored to your specific needs</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Actionable recommendations and next steps</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Follow-up summary with key insights</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Resource recommendations and templates</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* Booking Policy */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Booking Policy</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Sessions must be booked at least 2 hours in advance</p>
              <p>• Rescheduling is available up to 24 hours before your session</p>
              <p>• Cancellations must be made at least 2 hours in advance for a full refund</p>
              <p>• Late arrivals may result in shortened session time</p>
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Book Your Session</CardTitle>
              <CardDescription>Select your preferred date and time below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvailabilityCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                availableDates={availableDates}
              />

              {selectedDate && (
                <TimeSlotPicker
                  selectedDate={selectedDate}
                  timeSlots={availableSlots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                />
              )}

              {selectedSlot && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold">Booking Summary</h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Service:</span> {service.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Date:</span> {selectedDate.toLocaleDateString()}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Time:</span>{" "}
                        {selectedSlot.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Duration:</span> {service.duration} minutes
                      </p>
                      <p>
                        <span className="text-muted-foreground">Price:</span> {formatPrice(service.price)}
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full" size="lg">
                    <Link
                      href={`/checkout?service=${service.id}&date=${selectedDate.toISOString()}&time=${selectedSlot.startTime.toISOString()}`}
                    >
                      Continue to Checkout
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
