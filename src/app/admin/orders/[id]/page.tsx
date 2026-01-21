"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, Loader2, Printer, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { getOrderById, updateOrderStatus, updateOrderTrackingNumber, type OrderWithItems } from "@/src/lib/supabase/orders";
import { formatCurrency } from "@/src/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";
import { getShiprocketTrackingURL } from "@/src/lib/shiprocket-client";

const formatLongDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusIcon = (status: string | null) => {
  switch (status) {
    case "delivered":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "shipped":
      return <Truck className="h-5 w-5 text-blue-600" />;
    case "processing":
      return <Package className="h-5 w-5 text-yellow-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
};

const getStatusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "delivered":
      return "default";
    case "shipped":
      return "secondary";
    case "cancelled":
    case "return_rejected":
      return "destructive";
    case "return_requested":
    case "returned":
      return "outline";
    default:
      return "outline";
  }
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [shiprocketConfig, setShiprocketConfig] = useState<any>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();

    // Load Shiprocket config
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shiprocket_config");
      if (saved) {
        try {
          const config = JSON.parse(saved);
          // Check if token is expired
          if (config.tokenExpiry && Date.now() > config.tokenExpiry) {
            // Token expired, need to re-authenticate
            setShiprocketConfig({ ...config, token: undefined });
          } else {
            setShiprocketConfig(config);
          }
        } catch (e) {
          console.error("Failed to parse Shiprocket config:", e);
        }
      }
    }
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    setUpdatingStatus(true);
    const success = await updateOrderStatus(order.id, newStatus);

    if (success) {
      setOrder({ ...order, status: newStatus });
      toast.success("Order status updated");
    } else {
      toast.error("Failed to update status");
    }

    setUpdatingStatus(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateShipment = async () => {
    if (!order || !shiprocketConfig?.token) {
      toast.error("Please configure Shiprocket settings first");
      return;
    }

    setCreatingShipment(true);
    try {
      const shippingAddress = order.shipping_address as {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
      } | null;

      if (!shippingAddress) {
        toast.error("Shipping address is missing");
        return;
      }

      // Prepare shipment data
      const shipmentData = {
        order_id: order.order_number || order.id,
        order_date: new Date(order.created_at || Date.now()).toISOString().split('T')[0],
        pickup_location: shiprocketConfig.pickupLocation || "Primary",
        billing_customer_name: shippingAddress.firstName || "",
        billing_last_name: shippingAddress.lastName || "",
        billing_address: shippingAddress.address || "",
        billing_city: shippingAddress.city || "",
        billing_pincode: shippingAddress.zip || "",
        billing_state: shippingAddress.state || "",
        billing_country: shippingAddress.country || "India",
        billing_email: shippingAddress.email || order.email || "",
        billing_phone: shippingAddress.phone || "",
        shipping_is_billing: true,
        order_items: (order.items || []).map((item) => ({
          name: item.name || "Product",
          sku: item.sku || item.product_id || "SKU001",
          units: item.quantity,
          selling_price: Number(item.price) || 0,
        })),
        payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
        sub_total: order.subtotal || 0,
        weight: 0.5, // Default weight, can be calculated from items
      };

      const response = await fetch("/api/shiprocket/shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: shiprocketConfig.token,
          shipmentData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create shipment");
      }

      const result = await response.json();

      if (result.shipment_id && result.awb_code) {
        // Update order with tracking number
        await updateOrderTrackingNumber(order.id, result.awb_code);
        await updateOrderStatus(order.id, "shipped");

        toast.success(`Shipment created! AWB: ${result.awb_code}`);

        // Update local order state
        setOrder({
          ...order,
          tracking_number: result.awb_code,
          status: "shipped",
        });
      } else {
        throw new Error(result.message || "Shipment creation failed");
      }
    } catch (error: any) {
      console.error("Create shipment error:", error);
      toast.error(error.message || "Failed to create shipment");
    } finally {
      setCreatingShipment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Not Found</h1>
          <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
        </div>
        <Button asChild>
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const shippingAddress = order.shipping_address as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } | null;

  const orderItems = order.items || [];
  const subtotal = order.subtotal || orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const shipping = order.shipping_cost || 0;
  const tax = order.tax || 0;
  const discount = order.discount || 0;
  const total = order.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Order #{order.id.slice(0, 8)}...
            </h1>
            <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
              {order.status || "pending"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Placed on {formatLongDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({orderItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items in this order</p>
                ) : (
                  orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name || ""} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name || "Unknown Product"}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.sku && `SKU: ${item.sku} • `}
                          Qty: {item.quantity} × {formatCurrency(Number(item.price))}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Status & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Update Order Status</CardTitle>
              <CardDescription>Change the order status to notify the customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium capitalize">{order.status || "pending"}</span>
                </div>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={order.status || "pending"}
                  onValueChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-40">
                    {updatingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SelectValue />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="return_requested">Return Requested</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="return_rejected">Return Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Shiprocket Integration */}
          {shiprocketConfig?.token && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shiprocket Shipping
                </CardTitle>
                <CardDescription>
                  Create and manage shipments through Shiprocket
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.tracking_number ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Tracking Number</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {order.tracking_number}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={getShiprocketTrackingURL(order.tracking_number)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Track
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Create a shipment in Shiprocket for this order
                    </p>
                    <Button
                      onClick={handleCreateShipment}
                      disabled={creatingShipment || order.status === "cancelled"}
                      className="w-full"
                    >
                      {creatingShipment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Shipment...
                        </>
                      ) : (
                        <>
                          <Truck className="mr-2 h-4 w-4" />
                          Create Shiprocket Shipment
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {!shiprocketConfig?.token && (
                  <p className="text-xs text-muted-foreground">
                    <Link href="/admin/settings/shiprocket" className="text-primary underline">
                      Configure Shiprocket
                    </Link>{" "}
                    to enable shipping automation
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          {order.payment_method && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={order.payment_status === "paid" ? "default" : "outline"} className="capitalize">
                    {order.payment_status || "pending"}
                  </Badge>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tracking Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{order.tracking_number}</span>
                      {shiprocketConfig?.token && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          asChild
                        >
                          <a
                            href={getShiprocketTrackingURL(order.tracking_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">
                {shippingAddress?.firstName} {shippingAddress?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{shippingAddress?.email}</p>
              {shippingAddress?.phone && (
                <p className="text-sm text-muted-foreground">{shippingAddress?.phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-[#009744]">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {shippingAddress ? (
                <p className="text-sm">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                  <br />
                  {shippingAddress.address}
                  <br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                  <br />
                  {shippingAddress.country}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No shipping address provided</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
