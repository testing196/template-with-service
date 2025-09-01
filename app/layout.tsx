import type React from "react"
import type { Metadata } from "next"
import { BRAND_CONFIG } from "@/lib/constants"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: `${BRAND_CONFIG.name} - Professional Booking Services`,
  description:
    "Book professional consultation and workshop sessions with ease. Flexible scheduling, secure payments, and expert guidance.",
  generator: "v0.app",
  keywords: ["booking", "consultation", "workshop", "professional services", "scheduling"],
  authors: [{ name: BRAND_CONFIG.name }],
  openGraph: {
    title: `${BRAND_CONFIG.name} - Professional Booking Services`,
    description: "Book professional consultation and workshop sessions with ease.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_CONFIG.name} - Professional Booking Services`,
    description: "Book professional consultation and workshop sessions with ease.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'