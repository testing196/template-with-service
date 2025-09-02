import { NextRequest, NextResponse } from 'next/server';
import { confirmBooking, getBooking } from '@/lib/utils/booking-utils';

// This is a PayPal webhook handler for Next.js App Router
export async function POST(request: NextRequest) {
  try {
    // Get the webhook payload
    const payload = await request.json();
    
    // Verify the webhook event (in production, you should verify the signature)
    // TODO: Add webhook signature verification with PAYPAL_WEBHOOK_SECRET
    
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
          
          // Log success
          console.log(`PayPal webhook: Booking ${customId} confirmed after payment capture`);
          
          return NextResponse.json({ success: true });
        } else {
          console.error(`PayPal webhook: Booking ${customId} not found`);
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
      } else {
        console.error('PayPal webhook: No custom_id found in payload');
        return NextResponse.json({ error: 'No booking reference found' }, { status: 400 });
      }
    }
    
    // For other event types, just acknowledge receipt
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Webhook signature verification function (implement in production)
// This is a placeholder for the verification logic
async function verifyWebhookSignature(request: NextRequest): Promise<boolean> {
  // In production, verify the webhook signature using PayPal's SDK
  // https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
  
  // For now, return true to accept all webhooks
  return true;
}