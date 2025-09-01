import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Service } from "@/lib/types"

interface ServiceCardProps {
  service: Service
  showBookButton?: boolean
}

export function ServiceCard({ service, showBookButton = true }: ServiceCardProps) {
  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`
  }

  const formatServiceType = (type: string) => {
    switch (type) {
      case "IN_PERSON":
        return "In-person"
      case "VIRTUAL":
        return "Virtual"
      case "BOTH":
        return "In-person or Virtual"
      default:
        return type
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">
              <Link href={`/services/${service.slug}`} className="hover:text-primary transition-colors">
                {service.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-base line-clamp-3">{service.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {formatPrice(service.price)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{service.duration} min</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{formatServiceType(service.type)}</span>
          </div>
        </div>

        {service.location && <p className="text-sm text-muted-foreground mb-4">📍 {service.location}</p>}

        {showBookButton && (
          <Button asChild className="w-full">
            <Link href={`/services/${service.slug}`}>Book Now</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
