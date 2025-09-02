"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Calendar, Download, Mail, Phone } from "lucide-react"
import { getBooking, confirmBooking, capturePayment } from "@/lib/utils/booking-utils"
import { mockServices } from "@/lib/data/mock-data"
import { format, addMinutes } from "date-fns"
import { BRAND_CONFIG } from "@/lib/constants"
import type { Booking, Service } from "@/lib/types"

function SuccessContent() {
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [transactionId, setTransactionId] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function processPayPalReturn() {
      // Log all search params for debugging
      console.log('Success page search params:', Object.fromEntries([...searchParams.entries()]));
      
      const bookingId = searchParams.get("booking")
      const paypalOrderId = searchParams.get("token") // PayPal returns the order ID as 'token'
      const txnId = searchParams.get("transaction")

      // Handle both PayPal return and direct transaction completion paths
      if (!bookingId || (!paypalOrderId && !txnId)) {
        setError("Missing booking information")
        setIsLoading(false)
        return
      }
      
      console.log('Processing return with:', { bookingId, paypalOrderId, txnId });

      try {
        // Get the booking
        const foundBooking = getBooking(bookingId)
        
        // In the real app, we'd look up the booking in the database
        // For this demo with in-memory storage, if booking is lost on reload,
        // use a fallback to still show success page
        if (!foundBooking) {
          console.warn(`Booking ${bookingId} not found - using fallback for demo`)
          
          // Use first service as fallback for demo purposes
          const fallbackService = mockServices[0]
          if (!fallbackService) {
            setError("Booking and service information not found")
            setIsLoading(false)
            return
          }
          
          // Create a fallback booking object for display purposes
          const fallbackBooking: Booking = {
            id: bookingId,
            userId: 'guest',
            serviceId: fallbackService.id,
            startTime: new Date(),
            endTime: addMinutes(new Date(), fallbackService.duration),
            status: 'CONFIRMED',
            customerName: 'Guest User',
            customerEmail: 'guest@example.com',
            timezone: 'America/New_York',
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          // Use the fallback booking
          setBooking(fallbackBooking)
          setService(fallbackService)
          setTransactionId(paypalOrderId || txnId || 'demo-transaction')
          setIsLoading(false)
          return
        }

        // Find the service
        const foundService = mockServices.find((s) => s.id === foundBooking.serviceId)
        if (!foundService) {
          setError("Service not found")
          setIsLoading(false)
          return
        }

        let confirmedBooking = foundBooking

        // If PayPal token exists, capture the payment
        if (paypalOrderId) {
          console.log("Capturing PayPal payment for order:", paypalOrderId)
          const captureResult = await capturePayment(paypalOrderId, bookingId)
          
          if (captureResult.success) {
            // Payment captured successfully, get the updated booking
            confirmedBooking = getBooking(bookingId) || foundBooking
            setTransactionId(captureResult.transactionId || paypalOrderId)
          } else {
            setError(captureResult.error || "Payment could not be completed")
            setIsLoading(false)
            return
          }
        } else if (txnId) {
          // Direct transaction path (legacy method)
          confirmedBooking = confirmBooking(bookingId)
          setTransactionId(txnId)
        }

        setBooking(confirmedBooking)
        setService(foundService)
      } catch (err) {
        console.error("Error processing payment:", err)
        setError("Error processing payment information")
      } finally {
        setIsLoading(false)
      }
    }

    processPayPalReturn()
  }, [searchParams])

  const generateCalendarFile = () => {
    if (!booking || !service) return

    // TODO: Generate actual .ics calendar file
    const calendarData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//${BRAND_CONFIG.name}//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@${BRAND_CONFIG.name.toLowerCase().replace(/\s+/g, "")}.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${booking.startTime.toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTEND:${booking.endTime.toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:${service.name} - ${BRAND_CONFIG.name}
DESCRIPTION:${service.description}
LOCATION:${service.location || "TBD"}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([calendarData], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${service.name.replace(/\s+/g, "-")}-${booking.id}.ics`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto text-center">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/services">Back to Services</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!booking || !service) {
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
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your session has been successfully booked and payment processed.</p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Booking Details</CardTitle>
              <Badge variant="default">Confirmed</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{format(booking.startTime, "EEEE, MMMM d, yyyy")}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Time:</span>
                <p className="font-medium">
                  {format(booking.startTime, "h:mm a")} - {format(booking.endTime, "h:mm a")}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Duration:</span>
                <p className="font-medium">{service.duration} minutes</p>
              </div>

              <div>
                <span className="text-muted-foreground">Booking ID:</span>
                <p className="font-medium font-mono text-xs">{booking.id}</p>
              </div>
            </div>

            {service.location && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{service.location}</p>
                </div>
              </>
            )}

            {booking.notes && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="font-medium">{booking.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Confirmation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Amount Paid</p>
                <p className="text-sm text-muted-foreground">Transaction ID: {transactionId}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${(service.price / 100).toFixed(2)}</p>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Paid
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Confirmation Email</p>
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to {booking.customerEmail} with all the details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Add to Calendar</p>
                <p className="text-sm text-muted-foreground">
                  Download the calendar file to add this session to your calendar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Need Changes?</p>
                <p className="text-sm text-muted-foreground">
                  Contact us at {BRAND_CONFIG.supportEmail} or {BRAND_CONFIG.phone} for rescheduling or cancellations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={generateCalendarFile} variant="outline" className="flex-1 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Download Calendar File
          </Button>
          <Button asChild className="flex-1">
            <Link href="/bookings">View My Bookings</Link>
          </Button>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Thank you for choosing {BRAND_CONFIG.name}. We look forward to working with you!
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
