"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>
  isLoading?: boolean
  error?: string
}

export interface CheckoutFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  notes: string
}

export function CheckoutForm({ onSubmit, isLoading = false, error }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  })

  const [formErrors, setFormErrors] = useState<Partial<CheckoutFormData>>({})

  const validateForm = (): boolean => {
    const errors: Partial<CheckoutFormData> = {}

    if (!formData.customerName.trim()) {
      errors.customerName = "Name is required"
    }

    if (!formData.customerEmail.trim()) {
      errors.customerEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = "Please enter a valid email address"
    }

    if (formData.customerPhone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.customerPhone.replace(/[\s\-$$$$]/g, ""))) {
      errors.customerPhone = "Please enter a valid phone number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await onSubmit(formData)
  }

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                placeholder="Enter your full name"
                disabled={isLoading}
                className={formErrors.customerName ? "border-destructive" : ""}
              />
              {formErrors.customerName && <p className="text-sm text-destructive">{formErrors.customerName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                className={formErrors.customerEmail ? "border-destructive" : ""}
              />
              {formErrors.customerEmail && <p className="text-sm text-destructive">{formErrors.customerEmail}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange("customerPhone", e.target.value)}
              placeholder="Enter your phone number (optional)"
              disabled={isLoading}
              className={formErrors.customerPhone ? "border-destructive" : ""}
            />
            {formErrors.customerPhone && <p className="text-sm text-destructive">{formErrors.customerPhone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any specific requirements or questions? (optional)"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                "Complete Booking & Pay"
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>
              By completing this booking, you agree to our{" "}
              <a href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/booking-policy" className="underline hover:text-foreground">
                Booking Policy
              </a>
              .
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
