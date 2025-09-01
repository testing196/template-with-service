import type { Booking } from "../types"
import { addMinutes } from "date-fns"

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
}

export async function processPayment(paymentData: PaymentData): Promise<PaymentResult> {
  // TODO: Replace with actual payment provider integration (PayPal, Stripe, etc.)
  console.log("🔄 MOCK PAYMENT PROCESSING:", paymentData)

  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock success (90% success rate for demo)
  const success = Math.random() > 0.1

  if (success) {
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  } else {
    return {
      success: false,
      error: "Payment declined. Please try a different payment method.",
    }
  }
}

// Import mock services for booking creation
import { mockServices } from "../data/mock-data"
