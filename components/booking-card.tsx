"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Phone, Mail } from "lucide-react"
import { format, isAfter, isBefore, addHours } from "date-fns"
import { BOOKING_CONFIG } from "@/lib/constants"
import type { Booking, Service } from "@/lib/types"

interface BookingCardProps {
  booking: Booking
  service: Service
  onReschedule?: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
  showActions?: boolean
}

export function BookingCard({ booking, service, onReschedule, onCancel, showActions = true }: BookingCardProps) {
  const now = new Date()
  const rescheduleDeadline = addHours(booking.startTime, -BOOKING_CONFIG.rescheduleWindowHours)
  const cancelDeadline = addHours(booking.startTime, -BOOKING_CONFIG.cancelWindowHours)

  const canReschedule = isAfter(now, rescheduleDeadline) && booking.status === "CONFIRMED"
  const canCancel = isAfter(now, cancelDeadline) && booking.status === "CONFIRMED"
  const isPast = isBefore(booking.endTime, now)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default"
      case "PENDING":
        return "secondary"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{service.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Booking ID: {booking.id.slice(-8)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(booking.status)}>{booking.status.toLowerCase()}</Badge>
            {isPast && <Badge variant="outline">Past</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{format(booking.startTime, "EEEE, MMMM d, yyyy")}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>
              {format(booking.startTime, "h:mm a")} - {format(booking.endTime, "h:mm a")}
            </span>
          </div>

          {service.location && (
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{service.location}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="font-medium">{booking.customerName}</p>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{booking.customerEmail}</span>
              </div>
              {booking.customerPhone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{booking.customerPhone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Amount</p>
            <p className="font-semibold">{formatPrice(service.price)}</p>
          </div>
        </div>

        {booking.notes && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{booking.notes}</p>
            </div>
          </>
        )}

        {showActions && booking.status === "CONFIRMED" && !isPast && (
          <>
            <Separator />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReschedule?.(booking.id)}
                disabled={!canReschedule}
                className="flex-1"
              >
                Reschedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel?.(booking.id)}
                disabled={!canCancel}
                className="flex-1 text-destructive hover:text-destructive"
              >
                Cancel
              </Button>
            </div>
            {(!canReschedule || !canCancel) && (
              <p className="text-xs text-muted-foreground">
                {!canReschedule && `Reschedule deadline: ${BOOKING_CONFIG.rescheduleWindowHours}h before session`}
                {!canReschedule && !canCancel && " • "}
                {!canCancel && `Cancel deadline: ${BOOKING_CONFIG.cancelWindowHours}h before session`}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
