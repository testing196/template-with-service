# PayPal Integration Guide for BookEase

This document outlines how PayPal payment processing was integrated into the BookEase service booking application using the PayPal Orders API v2. Use this as a reference for implementing similar functionality in other projects.

## Table of Contents

1. [Overview](#overview)
2. [Setup and Configuration](#setup-and-configuration)
3. [Backend Integration](#backend-integration)
4. [Frontend Integration](#frontend-integration)
5. [Order Capture Flow](#order-capture-flow)
6. [Webhooks](#webhooks)
7. [Common Issues and Solutions](#common-issues-and-solutions)

## Overview

The BookEase app uses PayPal's Orders API v2 to process payments for service bookings. The integration consists of:

- A server-side PayPal service for creating and capturing orders
- Client-side integration with the PayPal JavaScript SDK
- Both direct "Book Now with PayPal" and traditional checkout flows
- Success page for handling payment completion

## Setup and Configuration

### Environment Variables

The following environment variables are used:

```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=ASi7F7Ra8viTD0qeNWNNx_hfvmCRWWmi04gpl8tFUg36HwPuGbSBLGTE-4E3-R1N1F5L_g2JD9Hvga7d
PAYPAL_CLIENT_SECRET=EGtZnxXVdAGm2WTey2d8RO1wKka1wdId3JbRigSgQmtopTuzM7Vpk9nB2Yc7KtaDtTpf4ejNGFoFzFJx
NEXT_PUBLIC_PAYPAL_API_URL=https://api-m.sandbox.paypal.com
```

The `NEXT_PUBLIC_` prefix makes variables available in client-side code.

### PayPal Developer Account

1. Create a PayPal Developer account at [developer.paypal.com](https://developer.paypal.com)
2. Create a sandbox application to get your client ID and secret
3. Configure webhook URLs (for production)

## Backend Integration

### PayPal Service Module

The core of the integration is a PayPal service module (`lib/services/paypal.ts`) that handles:

1. Authentication with OAuth
2. Creating orders
3. Capturing payments

Key functions:

```typescript
// Generate an access token for PayPal API
async function getAccessToken(): Promise<string>

// Create a PayPal order
export async function createOrder(params: CreateOrderArgs): Promise<PayPalOrderResponse>

// Capture a PayPal order after approval
export async function captureOrder(params: CaptureOrderArgs): Promise<PayPalCaptureResponse>

// Get details of a PayPal order
export async function getOrderDetails(orderId: string): Promise<any>
```

### Order Creation Parameters

When creating a PayPal order, you must include the following:

```typescript
// Critical: Must include item_total in the breakdown when using items array
const orderDetails: PayPalOrderDetails = {
  intent: 'CAPTURE',
  purchase_units: [
    {
      amount: {
        currency_code: currency,
        value: formattedAmount,
        breakdown: {
          item_total: {
            currency_code: currency,
            value: formattedAmount
          }
        }
      },
      description: params.serviceDescription,
      custom_id: params.customId || params.bookingId,
      items: [
        {
          name: params.serviceName,
          description: params.serviceDescription,
          quantity: '1',
          unit_amount: {
            currency_code: currency,
            value: formattedAmount,
          },
        },
      ],
    },
  ],
  application_context: {
    brand_name: 'BookEase',
    shipping_preference: 'NO_SHIPPING',
  },
};
```

**Important**: The `item_total` in the amount breakdown is required when using the `items` array. Omitting this will result in a 422 error.

### Booking Integration

The PayPal service is integrated with the booking system through the `processPayment` function in `lib/utils/booking-utils.ts`:

```typescript
export async function processPayment(paymentData: PaymentData): Promise<PaymentResult> {
  try {
    // Get booking and service details
    const booking = getBooking(paymentData.bookingId)
    if (!booking) {
      throw new Error("Booking not found")
    }
    const service = mockServices.find((s) => s.id === booking.serviceId)
    if (!service) {
      throw new Error("Service not found")
    }

    // Create a PayPal order
    const order = await createOrder({
      serviceName: service.name,
      serviceDescription: `Booking for ${service.name} on ${booking.startTime.toLocaleDateString()}`,
      amount: service.price,
      bookingId: booking.id,
      successUrl: `${window.location.origin}/checkout/success?booking=${booking.id}`,
      cancelUrl: `${window.location.origin}/checkout/cancel?booking=${booking.id}`,
    })

    // Find the approval URL
    const approvalUrl = order.links.find(link => link.rel === 'approve')?.href

    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal order response")
    }

    return {
      success: true,
      paypalOrderId: order.id,
      approvalUrl: approvalUrl,
      paypalOrderDetails: order,
      transactionId: order.id,
    }
  } catch (error) {
    // Error handling
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment processing failed",
    }
  }
}
```

## Frontend Integration

### PayPal JavaScript SDK

The PayPal JavaScript SDK is loaded in the pages that need payment processing:

```tsx
<Script
  src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`}
  strategy="afterInteractive"
/>
```

### Rendering PayPal Buttons

PayPal buttons are rendered in a container div:

```tsx
<div id="paypal-button-container" className="min-h-[150px]"></div>
```

The buttons are initialized with:

```typescript
window.paypal.Buttons({
  style: {
    layout: 'vertical',
    color: 'blue',
    shape: 'rect',
    label: 'pay'
  },
  
  // Create order on the server
  createOrder: async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Process payment with PayPal
      const paymentResult = await processPayment({
        amount: service.price,
        customerEmail: customerEmail,
        customerName: customerName,
        bookingId: bookingId,
      });
      
      if (paymentResult.success && paymentResult.paypalOrderId) {
        return paymentResult.paypalOrderId;
      } else {
        setError(paymentResult.error || "Could not create PayPal order");
        throw new Error(paymentResult.error || "Payment initialization failed");
      }
    } catch (err) {
      console.error("PayPal order creation error:", err);
      setError("Failed to create PayPal order. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  
  // Handle approval on the client
  onApprove: (data: any) => {
    // Redirect to success page with the order ID
    window.location.href = `/checkout/success?booking=${bookingId}&token=${data.orderID}`;
  },
  
  // Handle errors
  onError: (err: any) => {
    console.error("PayPal error:", err);
    setError("There was an error processing your payment. Please try again.");
  }
}).render('#paypal-button-container');
```

### TypeScript Integration

For TypeScript, define the PayPal window interface:

```typescript
declare global {
  interface Window {
    paypal: any;
  }
}
```

## Order Capture Flow

The order capture flow has these steps:

1. User selects a service and time slot
2. User clicks "Book Now with PayPal" or proceeds to checkout
3. App creates a booking record
4. App creates a PayPal order via the backend
5. User completes payment on PayPal
6. PayPal redirects back to success page with order token
7. Success page captures the payment via the backend
8. Booking is confirmed and user sees confirmation

### Success Page Implementation

The success page handles the PayPal redirect and captures the payment:

```typescript
async function processPayPalReturn() {
  const bookingId = searchParams.get("booking")
  const paypalOrderId = searchParams.get("token") // PayPal returns the order ID as 'token'
  
  // Validate parameters
  if (!bookingId || !paypalOrderId) {
    setError("Missing booking information")
    return
  }
  
  // Get booking details
  const booking = getBooking(bookingId)
  if (!booking) {
    setError("Booking not found")
    return
  }
  
  // Capture the payment
  const captureResult = await capturePayment(paypalOrderId, bookingId)
  
  if (captureResult.success) {
    // Payment successful
    setSuccess(true)
  } else {
    setError(captureResult.error || "Payment could not be completed")
  }
}
```

## Webhooks

PayPal webhooks are implemented to handle asynchronous payment events:

```typescript
// app/api/webhooks/paypal/route.ts
export async function POST(request: NextRequest) {
  try {
    // Get the webhook payload
    const payload = await request.json();
    
    // Verify the webhook event (in production, verify the signature)
    
    // Process the event based on type
    const eventType = payload.event_type;
    
    // Handle PAYMENT.CAPTURE.COMPLETED event
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = payload.resource;
      
      // Extract custom_id which should contain our booking ID
      const customId = resource.custom_id;
      
      if (customId) {
        // Find the booking
        const booking = getBooking(customId);
        
        if (booking) {
          // Confirm the booking
          confirmBooking(customId);
          return NextResponse.json({ success: true });
        }
      }
    }
    
    // For other event types, just acknowledge receipt
    return NextResponse.json({ received: true });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Common Issues and Solutions

### Item Total Required Error

**Issue**: 422 error with "ITEM_TOTAL_REQUIRED" message

**Solution**: When including items in your order, you must also include an `item_total` in the amount breakdown:

```typescript
amount: {
  currency_code: currency,
  value: formattedAmount,
  breakdown: {
    item_total: {
      currency_code: currency,
      value: formattedAmount
    }
  }
}
```

### Booking Not Found After Redirect

**Issue**: After PayPal redirect, booking information is lost (common in demo apps with in-memory storage)

**Solution**: 
1. In production, use a database to store bookings
2. For demos, implement fallback mechanisms:
   ```typescript
   // Create a fallback booking object if original is not found
   const fallbackBooking = {
     id: bookingId,
     // ... other booking properties
   };
   ```

### PayPal Buttons Not Displaying

**Issue**: PayPal buttons don't render

**Solutions**:
1. Check browser console for errors
2. Ensure the PayPal SDK is loaded successfully
3. Verify your client ID is correct
4. Make sure the container element exists when buttons are initialized

## Conclusion

This PayPal integration provides a seamless payment experience for service bookings. The implementation is flexible and can be adapted to various use cases.

For production deployments:
1. Replace sandbox credentials with production credentials
2. Implement proper error handling and logging
3. Add webhook signature verification
4. Use a database for storing orders and bookings
5. Consider adding additional payment methods