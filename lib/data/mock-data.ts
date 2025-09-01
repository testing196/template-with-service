import type { Service, AvailabilityRule, Blackout, User } from "../types"

export const mockServices: Service[] = [
  {
    id: "1",
    slug: "consultation",
    name: "Strategy Consultation",
    description: "One-on-one strategic planning session to discuss your goals and create an actionable roadmap.",
    duration: 60,
    price: 15000, // $150.00
    type: "BOTH",
    location: "Downtown Office or Video Call",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    slug: "workshop",
    name: "Team Workshop",
    description: "Interactive group session focused on team building and process improvement.",
    duration: 120,
    price: 30000, // $300.00
    type: "IN_PERSON",
    location: "Client Location or Our Conference Room",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
]

export const mockAvailabilityRules: AvailabilityRule[] = [
  // Strategy Consultation - Mon-Fri 9am-5pm
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `rule-${i + 1}`,
    serviceId: "1",
    dayOfWeek: i + 1, // Monday = 1
    startTime: "09:00",
    endTime: "17:00",
    timezone: "America/New_York",
    isActive: true,
  })),
  // Team Workshop - Tue, Thu 10am-4pm
  {
    id: "rule-6",
    serviceId: "2",
    dayOfWeek: 2, // Tuesday
    startTime: "10:00",
    endTime: "16:00",
    timezone: "America/New_York",
    isActive: true,
  },
  {
    id: "rule-7",
    serviceId: "2",
    dayOfWeek: 4, // Thursday
    startTime: "10:00",
    endTime: "16:00",
    timezone: "America/New_York",
    isActive: true,
  },
]

export const mockBlackouts: Blackout[] = [
  {
    id: "blackout-1",
    serviceId: null, // Applies to all services
    startDate: new Date("2024-12-24"),
    endDate: new Date("2024-12-26"),
    reason: "Holiday Break",
    isActive: true,
  },
  {
    id: "blackout-2",
    serviceId: "1",
    startDate: new Date("2024-12-15T14:00:00"),
    endDate: new Date("2024-12-15T16:00:00"),
    reason: "Conference Call",
    isActive: true,
  },
]

export const mockUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@bookease.com",
    name: "Admin User",
    phone: "+1 (555) 123-4567",
    isAdmin: true,
    createdAt: new Date("2024-01-01"),
  },
]
