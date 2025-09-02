"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookingSummary } from "@/components/booking-summary"
import { CheckoutForm, type CheckoutFormData } from "@/components/checkout-form"
import { mockServices } from "@/lib/data/mock-data"
import { createBooking, processPayment } from "@/lib/utils/booking-utils"
import { BOOKING_CONFIG } from "@/lib/constants"
import type { Service } from "@/lib/types"

// PayPal client ID from environment variables
const PAYPAL_CLIENT_ID = 'ASi7F7Ra8viTD0qeNWNNx_hfvmCRWWmi04gpl8tFUg36HwPuGbSBLGTE-4E3-R1N1F5L_g2JD9Hvga7d';

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [service, setService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [paypalButtonsReady, setPaypalButtonsReady] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

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

  // Initialize PayPal buttons when component mounts
  useEffect(() => {
    // Function to render PayPal buttons
    const initPayPalButtons = () => {
      if (!window.paypal || !service || !bookingId) return;
      
      const paypalButtonsContainer = document.getElementById('paypal-button-container');
      if (!paypalButtonsContainer) return;
      
      // Clear the container first
      paypalButtonsContainer.innerHTML = '';
      
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay'
        },
        
        // Create order on the server
        createOrder: async () => {
          try {
            setIsLoading(true);
            setError("");
            
            // Process payment with PayPal
            const customerEmail = (document.querySelector('#customerEmail') as HTMLInputElement)?.value || '';
            const customerName = (document.querySelector('#customerName') as HTMLInputElement)?.value || '';
            
            const paymentResult = await processPayment({
              amount: service.price,
              customerEmail,
              customerName,
              bookingId: bookingId,
            });
            
            if (paymentResult.success && paymentResult.paypalOrderId) {
              return paymentResult.paypalOrderId;
            } else {
              setError(paymentResult.error || "Could not create PayPal order");
              throw new Error(paymentResult.error || "Payment initialization failed");
            }
          } catch (err) {
            console.error("PayPal order creation error:", err);
            setError("Failed to create PayPal order. Please try again.");
            throw err;
          } finally {
            setIsLoading(false);
          }
        },
        
        // Handle approval on the client
        onApprove: (data: any) => {
          // Redirect to success page with the order ID
          router.push(`/checkout/success?booking=${bookingId}&token=${data.orderID}`);
        },
        
        // Handle errors
        onError: (err: any) => {
          console.error("PayPal error:", err);
          setError("There was an error processing your payment. Please try again.");
        }
      }).render('#paypal-button-container');
      
      setPaypalButtonsReady(true);
    };
    
    // Initialize buttons when everything is ready
    if (window.paypal && service && bookingId) {
      initPayPalButtons();
    }
  }, [service, bookingId, router]);

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

      // Save the booking ID to state
      setBookingId(booking.id);
      
      // No need to redirect here - we'll wait for PayPal button click
    } catch (err) {
      console.error("Checkout error:", err)
      setError("An error occurred while processing your booking. Please try again.")
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
            
            {/* PayPal Buttons Container - Only show after form submit */}
            {bookingId && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">Complete Payment with PayPal</h3>
                <div id="paypal-button-container" className="min-h-[150px]"></div>
                {!paypalButtonsReady && (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                    <p className="text-sm text-muted-foreground">Loading payment options...</p>
                  </div>
                )}
              </div>
            )}
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

// Add TypeScript interface for PayPal window
declare global {
  interface Window {
    paypal: any;
  }
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
      <>
        {/* PayPal SDK Script */}
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`}
          strategy="afterInteractive"
        />
        
        <CheckoutContent />
      </>
    </Suspense>
  )
}
