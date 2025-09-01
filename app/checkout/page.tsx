"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookingSummary } from "@/components/booking-summary"
import { CheckoutForm, type CheckoutFormData } from "@/components/checkout-form"
import { mockServices } from "@/lib/data/mock-data"
import { createBooking, processPayment } from "@/lib/utils/booking-utils"
import { BOOKING_CONFIG } from "@/lib/constants"
import type { Service } from "@/lib/types"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [service, setService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Parse URL parameters
  useEffect(() => {
    const serviceId = searchParams.get("service")
    const dateStr = searchParams.get("date")
    const timeStr = searchParams.get("time")

    if (!serviceId || !dateStr || !timeStr) {
      setError("Missing booking information. Please start over from the service page.")
      return
    }

    const foundService = mockServices.find((s) => s.id === serviceId)
    if (!foundService) {
      setError("Service not found. Please select a valid service.")
      return
    }

    const date = new Date(dateStr)
    const time = new Date(timeStr)

    if (isNaN(date.getTime()) || isNaN(time.getTime())) {
      setError("Invalid date or time. Please select a valid booking slot.")
      return
    }

    setService(foundService)
    setSelectedDate(date)
    setSelectedTime(time)
  }, [searchParams])

  const handleCheckoutSubmit = async (formData: CheckoutFormData) => {
    if (!service || !selectedTime) {
      setError("Missing booking information")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Create the booking
      const booking = createBooking({
        serviceId: service.id,
        startTime: selectedTime,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        notes: formData.notes,
        timezone: BOOKING_CONFIG.defaultTimezone,
      })

      // Process payment (mock)
      const paymentResult = await processPayment({
        amount: service.price,
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        bookingId: booking.id,
      })

      if (paymentResult.success) {
        // Redirect to success page
        router.push(`/checkout/success?booking=${booking.id}&transaction=${paymentResult.transactionId}`)
      } else {
        setError(paymentResult.error || "Payment failed. Please try again.")
      }
    } catch (err) {
      console.error("Checkout error:", err)
      setError("An error occurred while processing your booking. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (error && !service) {
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

  if (!service || !selectedDate || !selectedTime) {
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/services" className="hover:text-foreground transition-colors">
          Services
        </Link>
        <span>→</span>
        <Link href={`/services/${service.slug}`} className="hover:text-foreground transition-colors">
          {service.name}
        </Link>
        <span>→</span>
        <span className="text-foreground">Checkout</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
          <p className="text-muted-foreground">
            Review your booking details and provide your contact information to confirm.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm onSubmit={handleCheckoutSubmit} isLoading={isLoading} error={error} />
          </div>

          {/* Booking Summary */}
          <div>
            <BookingSummary
              service={service}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              className="sticky top-6"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
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
      <CheckoutContent />
    </Suspense>
  )
}
