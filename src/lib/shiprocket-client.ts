// Client-safe Shiprocket utilities
// These functions can be used in client components

/**
 * Generate a Shiprocket tracking URL for a given AWB code
 * This is a client-safe utility function
 */
export function getShiprocketTrackingURL(awbCode: string): string {
  return `https://shiprocket.co/tracking/${awbCode}`;
}
