"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookingCard } from "@/components/booking-card"
import { getUserBookings } from "@/lib/utils/booking-utils"
import { mockServices } from "@/lib/data/mock-data"
import { isBefore } from "date-fns"
import type { Booking, Service } from "@/lib/types"
import { BOOKING_CONFIG } from "@/lib/constants" // Declare BOOKING_CONFIG

// Mock current user - TODO: Replace with actual auth
const CURRENT_USER_ID = "guest"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user bookings and services
    const userBookings = getUserBookings(CURRENT_USER_ID)
    setBookings(userBookings)
    setServices(mockServices)
    setIsLoading(false)
  }, [])

  const now = new Date()
  const upcomingBookings = bookings.filter(
    (booking) => booking.status !== "CANCELLED" && !isBefore(booking.endTime, now),
  )
  const pastBookings = bookings.filter((booking) => booking.status !== "CANCELLED" && isBefore(booking.endTime, now))
  const cancelledBookings = bookings.filter((booking) => booking.status === "CANCELLED")

  const getServiceForBooking = (booking: Booking) => {
    return services.find((service) => service.id === booking.serviceId)
  }

  const handleReschedule = (bookingId: string) => {
    // TODO: Implement reschedule functionality
    console.log("Reschedule booking:", bookingId)
    alert("Reschedule functionality will be implemented with full booking system")
  }

  const handleCancel = (bookingId: string) => {
    // TODO: Implement cancel functionality with policy enforcement
    console.log("Cancel booking:", bookingId)
    if (confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      // Update booking status
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: "CANCELLED" as const, updatedAt: new Date() } : booking,
        ),
      )
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground mt-1">Manage your upcoming and past sessions</p>
          </div>
          <Button asChild>
            <Link href="/services">Book New Session</Link>
          </Button>
        </div>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't booked any sessions yet. Browse our services to get started.
              </p>
              <Button asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Bookings Tabs */
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="relative">
                Upcoming
                {upcomingBookings.length > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                    {upcomingBookings.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="relative">
                Past
                {pastBookings.length > 0 && (
                  <span className="ml-2 bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
                    {pastBookings.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="relative">
                Cancelled
                {cancelledBookings.length > 0 && (
                  <span className="ml-2 bg-destructive/10 text-destructive text-xs rounded-full px-2 py-0.5">
                    {cancelledBookings.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length > 0 ? (
                <>
                  <Alert>
                    <AlertDescription>
                      You can reschedule or cancel bookings up to {BOOKING_CONFIG.rescheduleWindowHours} hours and{" "}
                      {BOOKING_CONFIG.cancelWindowHours} hours before your session, respectively.
                    </AlertDescription>
                  </Alert>
                  <div className="grid gap-4">
                    {upcomingBookings.map((booking) => {
                      const service = getServiceForBooking(booking)
                      return service ? (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          service={service}
                          onReschedule={handleReschedule}
                          onCancel={handleCancel}
                        />
                      ) : null
                    })}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No upcoming bookings</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length > 0 ? (
                <div className="grid gap-4">
                  {pastBookings.map((booking) => {
                    const service = getServiceForBooking(booking)
                    return service ? (
                      <BookingCard key={booking.id} booking={booking} service={service} showActions={false} />
                    ) : null
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No past bookings</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledBookings.length > 0 ? (
                <div className="grid gap-4">
                  {cancelledBookings.map((booking) => {
                    const service = getServiceForBooking(booking)
                    return service ? (
                      <BookingCard key={booking.id} booking={booking} service={service} showActions={false} />
                    ) : null
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No cancelled bookings</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
