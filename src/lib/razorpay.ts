// Razorpay Client Integration
// Uses Sandbox/Test mode when test keys are configured

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Load Razorpay SDK
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Create Razorpay order via API
export async function createRazorpayOrder(orderId: string, amount: number): Promise<{
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
} | null> {
  try {
    const response = await fetch('/api/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Razorpay order error:', data.error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    return null;
  }
}

// Verify payment via API
export async function verifyRazorpayPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  orderId: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/razorpay', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}

// Open Razorpay checkout
export function openRazorpayCheckout(options: RazorpayOptions): void {
  if (typeof window === 'undefined' || !window.Razorpay) {
    console.error('Razorpay SDK not loaded');
    return;
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
}

// Test cards for Razorpay Sandbox:
// Card Number: 4111 1111 1111 1111
// Expiry: Any future date
// CVV: Any 3 digits
// OTP: 1234 (for 3D Secure)
//
// UPI ID for testing: success@razorpay
//
// More test details: https://razorpay.com/docs/payments/payments/test-card-upi-details/
