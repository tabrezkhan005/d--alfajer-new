// Payment Gateway Integration

export type PaymentGateway = 'stripe' | 'razorpay' | 'adyen';

export interface PaymentGatewayConfig {
  publicKey: string;
  secretKey?: string;
  webhook?: string;
  apiVersion?: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerId?: string;
  email: string;
  phone?: string;
  paymentMethod: 'card' | 'upi' | 'wallet' | 'apple_pay' | 'google_pay';
  metadata?: Record<string, any>;
  savePaymentMethod?: boolean;
  requires3D?: boolean;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorCode?: string;
  errorMessage?: string;
  redirectUrl?: string;
}

export interface SavedPaymentMethod {
  id: string;
  customerId: string;
  type: 'card' | 'wallet';
  lastFourDigits: string;
  expiryDate?: string;
  brand?: string;
  isDefault: boolean;
}

// Gateway Configuration from environment
export function getGatewayConfig(gateway: PaymentGateway): PaymentGatewayConfig {
  const configs: Record<PaymentGateway, PaymentGatewayConfig> = {
    stripe: {
      publicKey: process.env.NEXT_PUBLIC_STRIPE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY,
      apiVersion: 'latest',
    },
    razorpay: {
      publicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY || '',
      secretKey: process.env.RAZORPAY_SECRET_KEY,
      webhook: process.env.RAZORPAY_WEBHOOK,
    },
    adyen: {
      publicKey: process.env.NEXT_PUBLIC_ADYEN_KEY || '',
      secretKey: process.env.ADYEN_SECRET_KEY,
      apiVersion: 'v68',
    },
  };
  return configs[gateway];
}

// Mock Payment Processing (for demo)
export async function processPayment(
  request: PaymentRequest,
  gateway: PaymentGateway = 'stripe'
): Promise<PaymentResponse> {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock 3DS requirement
  const requires3D = request.requires3D && request.paymentMethod === 'card';

  if (requires3D) {
    return {
      success: false,
      status: 'pending',
      redirectUrl: `https://mock-3ds-provider.com/auth/${request.orderId}`,
      errorMessage: 'Requires 3D Secure authentication',
    };
  }

  // Mock success/failure (90% success rate)
  const isSuccess = Math.random() > 0.1;

  return {
    success: isSuccess,
    transactionId: `TXN-${Date.now()}`,
    paymentId: `PAY-${request.orderId}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    status: isSuccess ? 'completed' : 'failed',
    errorCode: isSuccess ? undefined : 'PAYMENT_DECLINED',
    errorMessage: isSuccess ? undefined : 'Card was declined. Please try another payment method.',
  };
}

// Tokenization for saved cards
export async function tokenizePaymentMethod(
  gateway: PaymentGateway,
  paymentDetails: any
): Promise<{ token: string; lastFourDigits: string }> {
  // Mock tokenization
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    token: `TOKEN-${Math.random().toString(36).substr(2, 20).toUpperCase()}`,
    lastFourDigits: paymentDetails.cardNumber?.slice(-4) || 'XXXX',
  };
}

// Refund processing
export async function processRefund(
  transactionId: string,
  amount: number,
  gateway: PaymentGateway = 'stripe'
): Promise<{ success: boolean; refundId?: string; message: string }> {
  // Mock refund processing
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    refundId: `REF-${Date.now()}`,
    message: `Refund of ${amount} processed successfully`,
  };
}

// Webhook verification
export function verifyWebhook(
  gateway: PaymentGateway,
  signature: string,
  payload: string
): boolean {
  // Mock webhook verification
  // In production, verify signature based on gateway's specifications
  return !!signature && !!payload;
}

// Subscription Payment
export interface SubscriptionPlan {
  id: string;
  name: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  amount: number;
  currency: string;
  trialDays?: number;
}

export async function createSubscription(
  customerId: string,
  planId: string,
  paymentMethodId: string,
  gateway: PaymentGateway = 'stripe'
): Promise<{ success: boolean; subscriptionId?: string; message: string }> {
  // Mock subscription creation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    subscriptionId: `SUB-${customerId}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    message: 'Subscription created successfully',
  };
}

// Payment method list
export async function getSavedPaymentMethods(
  customerId: string,
  gateway: PaymentGateway = 'stripe'
): Promise<SavedPaymentMethod[]> {
  // Mock fetch saved payment methods
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: 'pm-1234567890',
      customerId,
      type: 'card',
      lastFourDigits: '4242',
      expiryDate: '12/25',
      brand: 'Visa',
      isDefault: true,
    },
    {
      id: 'pm-0987654321',
      customerId,
      type: 'card',
      lastFourDigits: '5555',
      expiryDate: '06/24',
      brand: 'Mastercard',
      isDefault: false,
    },
  ];
}

// Idempotent payment handling
export const paymentIdempotencyKeys = new Map<string, PaymentResponse>();

export function getOrCreatePaymentIdempotencyKey(
  orderId: string
): string {
  if (!paymentIdempotencyKeys.has(orderId)) {
    paymentIdempotencyKeys.set(
      orderId,
      {
        success: false,
        status: 'pending',
        errorMessage: 'Payment not yet processed',
      }
    );
  }
  return orderId;
}
