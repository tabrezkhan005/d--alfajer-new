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
    const loadShiprocketConfig = async () => {
      if (typeof window === "undefined") return;

      // First check localStorage
      const saved = localStorage.getItem("shiprocket_config");
      if (saved) {
        try {
          const config = JSON.parse(saved);

          // Ensure pickupLocation defaults to "Primary" if not set
          if (!config.pickupLocation) {
            config.pickupLocation = "Primary";
          }

          // Check if token is expired
          if (config.tokenExpiry && Date.now() > config.tokenExpiry) {
            // Token expired, try to refresh using saved credentials
            if (config.email && config.password) {
              try {
                const response = await fetch("/api/shiprocket/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: config.email,
                    password: config.password,
                  }),
                });
                if (response.ok) {
                  const { token } = await response.json();
                  const updatedConfig = {
                    ...config,
                    token,
                    tokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
                    pickupLocation: config.pickupLocation || "Primary",
                  };
                  localStorage.setItem("shiprocket_config", JSON.stringify(updatedConfig));
                  setShiprocketConfig(updatedConfig);
                  return;
                }
              } catch (error) {
                console.error("Failed to refresh token:", error);
              }
            }
            // Token expired and couldn't refresh
            setShiprocketConfig({ ...config, token: undefined });
          } else {
            setShiprocketConfig(config);
          }
        } catch (e) {
          console.error("Failed to parse Shiprocket config:", e);
        }
      }

      // If no config in localStorage, try using environment variables
      const envEmail = process.env.NEXT_PUBLIC_SHIPROCKET_EMAIL;
      const envPassword = process.env.NEXT_PUBLIC_SHIPROCKET_PASSWORD;

      if (!saved && envEmail && envPassword) {
        try {
          const response = await fetch("/api/shiprocket/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: envEmail, password: envPassword }),
          });
          if (response.ok) {
            const { token } = await response.json();
            if (token) {
              const config = {
                email: envEmail,
                password: envPassword,
                token,
                tokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
                pickupLocation: "Primary", // Default to Primary
              };
              localStorage.setItem("shiprocket_config", JSON.stringify(config));
              setShiprocketConfig(config);
            }
          }
        } catch (error) {
          console.error("Failed to get Shiprocket token:", error);
        }
      }
    };

    loadShiprocketConfig();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    setUpdatingStatus(true);
    const success = await updateOrderStatus(order.id, newStatus);

    if (success) {
      setOrder({ ...order, status: newStatus });
      toast.success("Order status updated");

      // Trigger email notification
      try {
        fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            status: newStatus,
          }),
        }).then(res => res.json())
          .then(data => {
            if (data.success) {
              toast.success(`Email notification sent to customer`);
            } else {
              if (data.error && !data.error.includes("configured")) {
                 console.error("Email notification failed:", data.error);
              }
            }
          })
          .catch(err => console.error("Error sending email notification:", err));
      } catch (e) {
        console.error("Failed to trigger email notification", e);
      }
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

    // Validate that order has items
    const orderItems = order.items || [];
    if (orderItems.length === 0) {
      toast.error("Cannot create shipment: This order has no items. Please add items to the order first.");
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
        streetAddress?: string; // Checkout form uses streetAddress
        city?: string;
        state?: string;
        zip?: string;
        postalCode?: string; // Checkout form uses postalCode
        country?: string;
      } | null;

      if (!shippingAddress) {
        toast.error("Shipping address is missing");
        setCreatingShipment(false);
        return;
      }

      // Handle both naming conventions (address/streetAddress, zip/postalCode)
      const addressLine = shippingAddress.address || shippingAddress.streetAddress || "";
      const postalCode = shippingAddress.zip || shippingAddress.postalCode || "";

      // Validate required address fields
      if (!addressLine || !shippingAddress.city || !postalCode || !shippingAddress.state) {
        toast.error("Please ensure shipping address has complete details (address, city, pincode, state)");
        setCreatingShipment(false);
        return;
      }

      // Prepare order items for Shiprocket
      const shiprocketItems = orderItems.map((item: any) => {
        const price = Number(item.price) || Number(item.price_at_purchase) || 0;
        const quantity = item.quantity || 1;

        return {
          name: item.name || "Product",
          sku: item.sku || item.product_id || "SKU001",
          units: quantity,
          selling_price: price,
        };
      });

      // Calculate total weight (default 0.5kg per item if not specified)
      const totalWeight = orderItems.reduce((sum: number, item: any) => {
        return sum + (item.weight || 0.5) * (item.quantity || 1);
      }, 0) || 0.5;

      // Calculate estimated package dimensions based on number of items
      // Default dimensions for typical dry fruit/spice packages (in cm)
      const itemCount = orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      const baseLength = 20; // Base length in cm
      const baseBreadth = 15; // Base breadth in cm
      const baseHeight = 10; // Base height in cm

      // Adjust dimensions based on item count (add 5cm per additional 3 items)
      const additionalSpace = Math.floor(itemCount / 3) * 5;
      const packageLength = Math.min(baseLength + additionalSpace, 60); // Max 60cm
      const packageBreadth = Math.min(baseBreadth + Math.floor(additionalSpace / 2), 40); // Max 40cm
      const packageHeight = Math.min(baseHeight + Math.floor(additionalSpace / 2), 30); // Max 30cm

      // Prepare shipment data with all required fields for Shiprocket
      const shipmentData = {
        order_id: order.order_number || order.id,
        order_date: new Date(order.created_at || Date.now()).toISOString().split('T')[0],
        pickup_location: shiprocketConfig.pickupLocation || process.env.NEXT_PUBLIC_SHIPROCKET_PICKUP_LOCATION || "Primary",
        billing_customer_name: shippingAddress.firstName || "",
        billing_last_name: shippingAddress.lastName || "",
        billing_address: addressLine,
        billing_city: shippingAddress.city || "",
        billing_pincode: postalCode,
        billing_state: shippingAddress.state || "",
        billing_country: shippingAddress.country || "India",
        billing_email: shippingAddress.email || order.email || "",
        billing_phone: shippingAddress.phone || "",
        shipping_is_billing: true,
        order_items: shiprocketItems,
        payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
        sub_total: Number(order.subtotal) || 0,
        weight: totalWeight,
        // Required dimension fields for Shiprocket API
        length: packageLength,
        breadth: packageBreadth,
        height: packageHeight,
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

      const result = await response.json();

      console.log("Shiprocket full response:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        const errorMessage = result.error || result.message || `Failed to create shipment (Status: ${response.status})`;
        console.error("Shiprocket API error:", result);
        throw new Error(errorMessage);
      }

      // Shiprocket API can return different response formats
      // Check for various success indicators
      const srOrderId = result.order_id || result.payload?.order_id;
      const shipmentId = result.shipment_id || result.payload?.shipment_id;
      const awbCode = result.awb_code || result.payload?.awb_code;
      const statusCode = result.status_code || result.status;

      // Check if order was created successfully (even without AWB)
      if (srOrderId || shipmentId) {
        // If we have AWB code, update tracking
        if (awbCode) {
          // Try to update database, but don't fail if it doesn't work
          const trackingUpdated = await updateOrderTrackingNumber(order.id, awbCode);
          const statusUpdated = await updateOrderStatus(order.id, "shipped");

          if (!trackingUpdated || !statusUpdated) {
            console.warn("Database update may have failed, but Shiprocket order was created successfully");
          }

          toast.success(`Shipment created! AWB: ${awbCode}`);

          // Trigger Shipped Email
          try {
             fetch('/api/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                status: 'shipped',
              }),
            });
          } catch (e) {
             console.error("Failed to trigger shipped email", e);
          }

          setOrder({
            ...order,
            tracking_number: awbCode,
            status: "shipped",
          });
        } else {
          // Order created but no AWB yet - this happens when courier isn't auto-assigned
          // Store the shipment ID for later reference
          const trackingRef = `SR-${shipmentId || srOrderId}`;

          // Try to update database, but don't fail if it doesn't work
          const trackingUpdated = await updateOrderTrackingNumber(order.id, trackingRef);
          const statusUpdated = await updateOrderStatus(order.id, "processing");

          if (!trackingUpdated || !statusUpdated) {
            console.warn("Database update may have failed, but Shiprocket order was created successfully");
          }

          toast.success(`Order registered with Shiprocket! ID: ${srOrderId || shipmentId}. Courier assignment pending.`);

          // Trigger Processing Email
          try {
             fetch('/api/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                status: 'processing',
              }),
            });
          } catch (e) {
             console.error("Failed to trigger processing email", e);
          }

          // Update local state regardless of DB update
          setOrder({
            ...order,
            tracking_number: trackingRef,
            status: "processing",
          });
        }
      } else if (statusCode === 1 || statusCode === 200 || result.status === "success") {
        // Some success responses might not have order_id in expected place
        toast.success("Shipment request sent to Shiprocket successfully!");
        await updateOrderStatus(order.id, "processing");

        // Trigger Processing Email
        try {
            fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              status: 'processing',
            }),
          });
        } catch (e) {
            console.error("Failed to trigger processing email", e);
        }

        setOrder({
          ...order,
          status: "processing",
        });
      } else {
        // Check for error messages in the response
        const errorMsg = result.message || result.error || result.errors || "Shipment creation failed - unexpected response from Shiprocket";
        const errorDetails = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg;
        console.error("Shiprocket response:", result);
        throw new Error(errorDetails);
      }
    } catch (error: any) {
      console.error("Create shipment error:", error);
      const errorMessage = error.message || "Failed to create shipment";
      toast.error(errorMessage);
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
  // Use subtotal from database, or calculate from items if not available
  const subtotal = order.subtotal || (orderItems.length > 0 ? orderItems.reduce((sum: number, item: any) => {
    const itemTotal = (Number(item.price) || Number(item.price_at_purchase) || 0) * (item.quantity || 0);
    return sum + itemTotal;
  }, 0) : 0);
  const shipping = order.shipping_cost || 0;
  const tax = order.tax || 0;
  const discount = order.discount || 0;
  // Use total_amount from database, fallback to calculated total
  const total = order.total_amount || order.total || (subtotal - discount + shipping + tax);

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

          {/* Shipment Status & Tracking */}
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#009744]" />
                Shipment Status
              </CardTitle>
              <CardDescription>
                Track and manage order fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Progress Timeline */}
              <div className="relative">
                <div className="flex justify-between items-center">
                  {[
                    { status: "pending", label: "Order Placed", icon: Clock },
                    { status: "processing", label: "Processing", icon: Package },
                    { status: "shipped", label: "Shipped", icon: Truck },
                    { status: "delivered", label: "Delivered", icon: CheckCircle2 },
                  ].map((step, index, arr) => {
                    const isActive = order.status === step.status;
                    const isPast =
                      (order.status === "processing" && index < 1) ||
                      (order.status === "shipped" && index < 2) ||
                      (order.status === "delivered" && index < 3) ||
                      (order.status === "cancelled" && index === 0);
                    const isCancelled = order.status === "cancelled";
                    const Icon = step.icon;

                    return (
                      <div key={step.status} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCancelled && index === 0
                              ? "bg-red-100 border-2 border-red-500"
                              : isActive
                              ? "bg-[#009744] text-white shadow-lg shadow-[#009744]/30"
                              : isPast
                              ? "bg-[#009744]/20 text-[#009744] border-2 border-[#009744]"
                              : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium text-center ${
                            isActive
                              ? "text-[#009744]"
                              : isPast
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0" style={{ marginLeft: '40px', marginRight: '40px' }}>
                  <div
                    className="h-full bg-[#009744] transition-all duration-500"
                    style={{
                      width: order.status === "pending" ? "0%"
                        : order.status === "processing" ? "33%"
                        : order.status === "shipped" ? "66%"
                        : order.status === "delivered" ? "100%"
                        : "0%"
                    }}
                  />
                </div>
              </div>

              {/* Current Status Badge */}
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/50">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  order.status === "pending" ? "bg-yellow-500"
                  : order.status === "processing" ? "bg-blue-500"
                  : order.status === "shipped" ? "bg-purple-500"
                  : order.status === "delivered" ? "bg-green-500"
                  : order.status === "cancelled" ? "bg-red-500"
                  : "bg-gray-400"
                }`} />
                <span className="font-semibold text-lg capitalize">
                  {order.status === "return_requested" ? "Return Requested"
                   : order.status === "return_rejected" ? "Return Rejected"
                   : order.status || "Pending"}
                </span>
              </div>

              {/* Tracking Information */}
              {order.tracking_number ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Truck className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">Shipment Created</p>
                        <p className="text-lg font-bold text-green-800 font-mono">
                          {order.tracking_number}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      asChild
                    >
                      <a
                        href={getShiprocketTrackingURL(order.tracking_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Track Shipment
                      </a>
                    </Button>
                  </div>

                  {/* Quick Status Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Carrier</p>
                      <p className="font-semibold">Shiprocket</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="font-semibold text-sm">{formatLongDate(order.updated_at)}</p>
                    </div>
                  </div>
                </div>
              ) : shiprocketConfig?.token ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="h-5 w-5 text-amber-600" />
                      <p className="text-sm font-medium text-amber-800">
                        No shipment created yet
                      </p>
                    </div>
                    <p className="text-xs text-amber-700 mb-4">
                      Create a Shiprocket shipment to enable tracking and automated delivery updates.
                    </p>
                    <Button
                      onClick={handleCreateShipment}
                      disabled={creatingShipment || order.status === "cancelled"}
                      className="w-full bg-[#009744] hover:bg-[#008339]"
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
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">
                    Shiprocket integration not configured
                  </p>
                  <Link
                    href="/admin/settings/shiprocket"
                    className="text-sm text-[#009744] hover:underline font-medium"
                  >
                    Configure Shiprocket →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

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
