/**
 * PayPal Service
 * Handles interaction with PayPal Orders API v2
 */

// PayPal API Configuration
const PAYPAL_CLIENT_ID = 'ASi7F7Ra8viTD0qeNWNNx_hfvmCRWWmi04gpl8tFUg36HwPuGbSBLGTE-4E3-R1N1F5L_g2JD9Hvga7d';
const PAYPAL_CLIENT_SECRET = 'EGtZnxXVdAGm2WTey2d8RO1wKka1wdId3JbRigSgQmtopTuzM7Vpk9nB2Yc7KtaDtTpf4ejNGFoFzFJx';
const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com';

// Types for PayPal API
export interface PayPalOrderDetails {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
      breakdown?: {
        item_total?: {
          currency_code: string;
          value: string;
        };
        tax_total?: {
          currency_code: string;
          value: string;
        };
        discount?: {
          currency_code: string;
          value: string;
        };
      };
    };
    items?: Array<{
      name: string;
      description?: string;
      quantity: string;
      unit_amount: {
        currency_code: string;
        value: string;
      };
    }>;
    description?: string;
    reference_id?: string;
    custom_id?: string;
  }>;
  application_context?: {
    brand_name?: string;
    return_url?: string;
    cancel_url?: string;
    shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
  };
}

export interface PayPalOrderResponse {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: 'COMPLETED' | 'DECLINED';
  purchase_units: Array<{
    reference_id: string;
    shipping?: {
      address: {
        address_line_1: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
    payments: {
      captures: Array<{
        id: string;
        status: 'COMPLETED' | 'DECLINED' | 'PENDING';
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
  payer: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    payer_id: string;
  };
}

export interface CreateOrderArgs {
  serviceName: string;
  serviceDescription?: string;
  amount: number; // in cents
  currency?: string;
  customId?: string;
  bookingId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CaptureOrderArgs {
  orderId: string;
}

/**
 * Generate an access token for PayPal API
 * @returns Access token string
 */
async function getAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal token error: ${errorData.error_description}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw new Error('Failed to authenticate with PayPal');
  }
}

/**
 * Create a PayPal order
 * @param params Order parameters
 * @returns PayPal order response
 */
export async function createOrder(params: CreateOrderArgs): Promise<PayPalOrderResponse> {
  try {
    const accessToken = await getAccessToken();
    
    // Format the amount from cents to dollars with 2 decimal places
    const formattedAmount = (params.amount / 100).toFixed(2);
    const currency = params.currency || 'USD';
    
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

    // Add return URLs if provided
    if (params.successUrl) {
      orderDetails.application_context!.return_url = params.successUrl;
    }
    
    if (params.cancelUrl) {
      orderDetails.application_context!.cancel_url = params.cancelUrl;
    }

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderDetails),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal create order error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw new Error('Failed to create PayPal order');
  }
}

/**
 * Capture a PayPal order after approval
 * @param params Capture parameters
 * @returns PayPal capture response
 */
export async function captureOrder(params: CaptureOrderArgs): Promise<PayPalCaptureResponse> {
  try {
    const accessToken = await getAccessToken();
    
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${params.orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal capture order error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw new Error('Failed to capture PayPal payment');
  }
}

/**
 * Get details of a PayPal order
 * @param orderId PayPal order ID
 * @returns Order details
 */
export async function getOrderDetails(orderId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();
    
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal get order error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting PayPal order details:', error);
    throw new Error('Failed to get PayPal order details');
  }
}