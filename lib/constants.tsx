// Branding placeholders - easy to customize later
export const BRAND_CONFIG = {
  name: "BookEase",
  primaryColor: "#2563eb", // blue-600
  logoSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`,
  supportEmail: "support@bookease.com",
  phone: "+1 (555) 123-4567",
  address: "123 Business St, Suite 100, City, State 12345",
} as const

export const BOOKING_CONFIG = {
  holdDurationMinutes: 10,
  defaultTimezone: "America/New_York",
  minLeadTimeHours: 2,
  maxAdvanceDays: 90,
  rescheduleWindowHours: 24,
  cancelWindowHours: 2,
} as const
