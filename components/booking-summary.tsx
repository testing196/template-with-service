import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { Service } from "@/lib/types"

interface BookingSummaryProps {
  service: Service
  selectedDate: Date
  selectedTime: Date
  className?: string
}

export function BookingSummary({ service, selectedDate, selectedTime, className }: BookingSummaryProps) {
  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Booking Summary</span>
          <Badge variant="secondary">{formatPrice(service.price)}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">{format(selectedTime, "h:mm a")}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{service.duration} minutes</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">{formatServiceType(service.type)}</span>
          </div>

          {service.location && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium text-right">{service.location}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center font-semibold">
          <span>Total:</span>
          <span className="text-lg">{formatPrice(service.price)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
