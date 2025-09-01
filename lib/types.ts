export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED"
export type ServiceType = "IN_PERSON" | "VIRTUAL" | "BOTH"

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  isAdmin: boolean
  createdAt: Date
}

export interface Service {
  id: string
  slug: string
  name: string
  description: string
  duration: number // minutes
  price: number // cents
  type: ServiceType
  location?: string
  isActive: boolean
  createdAt: Date
}

export interface AvailabilityRule {
  id: string
  serviceId: string
  dayOfWeek: number // 0-6, Sunday = 0
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  timezone: string
  isActive: boolean
}

export interface Blackout {
  id: string
  serviceId?: string // null = applies to all services
  startDate: Date
  endDate: Date
  reason?: string
  isActive: boolean
}

export interface Booking {
  id: string
  userId: string
  serviceId: string
  startTime: Date
  endTime: Date
  status: BookingStatus
  customerName: string
  customerEmail: string
  customerPhone?: string
  notes?: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  id: string
  userId?: string
  action: string
  entityType: string
  entityId: string
  details: Record<string, any>
  createdAt: Date
}

export interface TimeSlot {
  startTime: Date
  endTime: Date
  isAvailable: boolean
  isHeld?: boolean
  holdExpiresAt?: Date
}
