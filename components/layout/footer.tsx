import Link from "next/link"
import { BRAND_CONFIG } from "@/lib/constants"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 text-primary" dangerouslySetInnerHTML={{ __html: BRAND_CONFIG.logoSvg }} />
              <span className="text-lg font-semibold">{BRAND_CONFIG.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional booking services made simple. Schedule your sessions with ease.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Services
                </Link>
              </li>
              <li>
                <Link
                  href="/services/consultation"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Consultations
                </Link>
              </li>
              <li>
                <Link
                  href="/services/workshop"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Workshops
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/bookings" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/booking-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Booking Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 {BRAND_CONFIG.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{BRAND_CONFIG.supportEmail}</span>
            <span>{BRAND_CONFIG.phone}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
