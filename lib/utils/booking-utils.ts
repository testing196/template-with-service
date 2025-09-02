import type { Booking } from "../types"
import { addMinutes } from "date-fns"
import { createOrder, captureOrder, PayPalOrderResponse, PayPalCaptureResponse } from "../services/paypal"

export interface CreateBookingData {
  serviceId: string
  startTime: Date
  customerName: string
  customerEmail: string
  customerPhone?: string
  notes?: string
  timezone: string
}

// Mock booking storage (in production, this would be a database)
const mockBookings: Booking[] = []

// Add some sample bookings for testing
// This is needed because mock bookings are lost on page reload
function createSampleBookings() {
  // Only create if there are no bookings yet
  if (mockBookings.length === 0) {
    // Add a sample booking that can be used for testing PayPal redirects
    const sampleBooking: Booking = {
      id: 'booking-1756791343423-m9l1a6o0h',
      userId: 'guest',
      serviceId: mockServices[0]?.id || 'service-123',
      startTime: new Date(),
      endTime: addMinutes(new Date(), 60),
      status: 'PENDING',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      timezone: 'America/New_York',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    mockBookings.push(sampleBooking)
    console.log('Created sample booking for testing:', sampleBooking.id)
  }
}

// Create sample bookings on module initialization
createSampleBookings()

export function createBooking(data: CreateBookingData): Booking {
  // TODO: Replace with actual database integration
  const service = mockServices.find((s) => s.id === data.serviceId)
  if (!service) {
    throw new Error("Service not found")
  }

  const booking: Booking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: "guest", // TODO: Replace with actual user ID from auth
    serviceId: data.serviceId,
    startTime: data.startTime,
    endTime: addMinutes(data.startTime, service.duration),
    status: "PENDING",
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    notes: data.notes,
    timezone: data.timezone,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  mockBookings.push(booking)
  return booking
}

export function confirmBooking(bookingId: string): Booking {
  // TODO: Replace with actual database integration
  const booking = mockBookings.find((b) => b.id === bookingId)
  if (!booking) {
    throw new Error("Booking not found")
  }

  booking.status = "CONFIRMED"
  booking.updatedAt = new Date()
  return booking
}

export function getBooking(bookingId: string): Booking | null {
  // TODO: Replace with actual database integration
  return mockBookings.find((b) => b.id === bookingId) || null
}

export function getUserBookings(userId: string): Booking[] {
  // TODO: Replace with actual database integration
  return mockBookings.filter((b) => b.userId === userId)
}

// Mock payment processing
export interface PaymentData {
  amount: number // in cents
  customerEmail: string
  customerName: string
  bookingId: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  paypalOrderId?: string
  approvalUrl?: string
  paypalOrderDetails?: PayPalOrderResponse
  captureDetails?: PayPalCaptureResponse
}

export async function processPayment(paymentData: PaymentData): Promise<PaymentResult> {
  try {
    // Get the booking details
    const booking = getBooking(paymentData.bookingId)
    if (!booking) {
      throw new Error("Booking not found")
    }

    // Get the service details
    const service = mockServices.find((s) => s.id === booking.serviceId)
    if (!service) {
      throw new Error("Service not found")
    }

    // Create a PayPal order
    const order = await createOrder({
      serviceName: service.name,
      serviceDescription: `Booking for ${service.name} on ${booking.startTime.toLocaleDateString()} at ${booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      amount: service.price,
      bookingId: booking.id,
      // Add success and cancel URLs if needed
      successUrl: `${window.location.origin}/checkout/success?booking=${booking.id}`,
      cancelUrl: `${window.location.origin}/checkout/cancel?booking=${booking.id}`,
    })

    // Find the approval URL
    const approvalUrl = order.links.find(link => link.rel === 'approve')?.href

    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal order response")
    }

    return {
      success: true,
      paypalOrderId: order.id,
      approvalUrl: approvalUrl,
      paypalOrderDetails: order,
      transactionId: order.id, // Use PayPal order ID as transaction ID for now
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment processing failed",
    }
  }
}

// Import mock services for booking creation
import { mockServices } from "../data/mock-data"

/**
 * Complete a payment using PayPal order capture
 * @param orderId PayPal order ID to capture
 * @param bookingId Associated booking ID
 */
export async function capturePayment(orderId: string, bookingId: string): Promise<PaymentResult> {
  try {
    // Capture the payment
    const captureResponse = await captureOrder({ orderId })
    
    // Update booking status if payment is successful
    if (captureResponse.status === 'COMPLETED') {
      // Confirm the booking
      confirmBooking(bookingId)
      
      return {
        success: true,
        transactionId: captureResponse.id,
        paypalOrderId: orderId,
        captureDetails: captureResponse,
      }
    } else {
      return {
        success: false,
        error: `Payment not completed. Status: ${captureResponse.status}`,
        paypalOrderId: orderId,
        captureDetails: captureResponse,
      }
    }
  } catch (error) {
    console.error("Payment capture error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment capture failed",
      paypalOrderId: orderId,
    }
  }
}
