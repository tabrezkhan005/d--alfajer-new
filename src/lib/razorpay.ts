// Razorpay Client Integration - Production Ready
// Secure payment gateway integration with proper error handling and fallbacks

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

// Load Razorpay SDK with retry mechanism
export function loadRazorpayScript(retries = 3): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      if (window.Razorpay) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    
    script.onerror = () => {
      if (retries > 0) {
        // Retry loading the script
        setTimeout(() => {
          loadRazorpayScript(retries - 1).then(resolve);
        }, 1000);
      } else {
        console.error('Failed to load Razorpay SDK after retries');
        resolve(false);
      }
    };
    
    document.body.appendChild(script);
  });
}

// Create Razorpay order via API with retry and error handling
export async function createRazorpayOrder(
  orderId: string, 
  amount: number,
  retries = 2
): Promise<{
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
} | null> {
  try {
    const response = await fetch('/api/razorpay', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, amount }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      
      // Retry on network errors or 5xx errors
      if (retries > 0 && (response.status >= 500 || response.status === 0)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return createRazorpayOrder(orderId, amount, retries - 1);
      }
      
      console.error('Razorpay order creation failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.error) {
      console.error('Razorpay order error:', data.error);
      throw new Error(data.error);
    }

    if (!data.razorpayOrderId || !data.razorpayKeyId) {
      throw new Error('Invalid response from Razorpay API');
    }

    return data;
  } catch (error: any) {
    console.error('Failed to create Razorpay order:', error);
    // Return null to allow fallback handling
    return null;
  }
}

// Verify payment via API with retry mechanism
export async function verifyRazorpayPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  orderId: string,
  retries = 2
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return { success: false, error: 'Missing required payment verification parameters' };
    }

    const response = await fetch('/api/razorpay', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      
      // Retry on network errors or 5xx errors
      if (retries > 0 && (response.status >= 500 || response.status === 0)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, retries - 1);
      }
      
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    
    if (data.success === true) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Payment verification failed' };
    }
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    return { success: false, error: error.message || 'Network error during payment verification' };
  }
}

// Open Razorpay checkout with error handling
export function openRazorpayCheckout(options: RazorpayOptions): void {
  if (typeof window === 'undefined' || !window.Razorpay) {
    console.error('Razorpay SDK not loaded');
    if (options.modal?.ondismiss) {
      options.modal.ondismiss();
    }
    return;
  }

  try {
    // Validate required options
    if (!options.key || !options.amount || !options.order_id) {
      console.error('Missing required Razorpay options');
      if (options.modal?.ondismiss) {
        options.modal.ondismiss();
      }
      return;
    }

    // Enhanced options with error handling
    const enhancedOptions = {
      ...options,
      handler: (response: RazorpayResponse) => {
        try {
          if (options.handler) {
            options.handler(response);
          }
        } catch (error) {
          console.error('Error in Razorpay payment handler:', error);
        }
      },
      modal: {
        ...options.modal,
        ondismiss: () => {
          try {
            if (options.modal?.ondismiss) {
              options.modal.ondismiss();
            }
          } catch (error) {
            console.error('Error in Razorpay modal dismiss handler:', error);
          }
        },
      },
      prefill: {
        ...options.prefill,
      },
      theme: {
        color: options.theme?.color || '#009744', // Use brand color
      },
      notes: {
        ...options.notes,
        order_id: options.order_id,
      },
    };

    const rzp = new window.Razorpay(enhancedOptions);
    
    // Add error handlers
    rzp.on('payment.failed', (response: any) => {
      console.error('Razorpay payment failed:', response.error);
    });

    rzp.open();
  } catch (error) {
    console.error('Failed to open Razorpay checkout:', error);
    if (options.modal?.ondismiss) {
      options.modal.ondismiss();
    }
  }
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
