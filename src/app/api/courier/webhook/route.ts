/**
 * Courier webhook – same handler as Shiprocket webhook.
 * Use this URL in the provider dashboard to avoid keywords (shiprocket, sr, kr) in the path.
 * e.g. https://yourdomain.com/api/courier/webhook
 */
export { POST } from "@/src/app/api/shiprocket/webhook/route";
