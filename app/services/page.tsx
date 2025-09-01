import type { Metadata } from "next"
import { ServiceCard } from "@/components/service-card"
import { mockServices } from "@/lib/data/mock-data"
import { BRAND_CONFIG } from "@/lib/constants"

export const metadata: Metadata = {
  title: `Services - ${BRAND_CONFIG.name}`,
  description: "Browse our professional consultation and workshop services. Expert guidance tailored to your needs.",
  openGraph: {
    title: `Services - ${BRAND_CONFIG.name}`,
    description: "Browse our professional consultation and workshop services. Expert guidance tailored to your needs.",
  },
}

export default function ServicesPage() {
  const activeServices = mockServices.filter((service) => service.isActive)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Services</h1>
        <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
          Choose from our range of professional services designed to help you achieve your goals. Each session is
          tailored to your specific needs and objectives.
        </p>
      </div>

      {/* Services Grid */}
      {activeServices.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {activeServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">No Services Available</h2>
          <p className="text-muted-foreground">
            We're currently updating our service offerings. Please check back soon!
          </p>
        </div>
      )}

      {/* CTA Section */}
      <div className="text-center mt-16 py-12 bg-muted/30 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Need Something Custom?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Don't see exactly what you're looking for? We offer customized sessions tailored to your specific
          requirements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`mailto:${BRAND_CONFIG.supportEmail}?subject=Custom Service Inquiry`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Contact Us
          </a>
          <a
            href={`tel:${BRAND_CONFIG.phone}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Call {BRAND_CONFIG.phone}
          </a>
        </div>
      </div>
    </div>
  )
}
