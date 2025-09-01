import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BRAND_CONFIG } from "@/lib/constants"

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 text-primary" dangerouslySetInnerHTML={{ __html: BRAND_CONFIG.logoSvg }} />
              <span className="text-xl font-semibold text-foreground">{BRAND_CONFIG.name}</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              href="/bookings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Bookings
            </Link>
            <Link
              href="/account"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Account
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/services">Book Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
