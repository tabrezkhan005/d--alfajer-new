"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, Loader2, Printer, RefreshCw, ExternalLink, Star } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { getOrderById, updateOrderStatus, updateOrderTrackingNumber, updateShiprocketIds, type OrderWithItems } from "@/src/lib/supabase/orders";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";
import { ScrollArea } from "@/src/components/ui/scroll-area";

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

  // New state for shipment modal
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [printingLabel, setPrintingLabel] = useState(false);

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

      let config: any = null;

      // 1. Try Supabase User Metadata (Persistent)
      try {
         const { createClient } = await import("@/src/lib/supabase/client");
         const supabase = createClient();
         const { data: { user } } = await supabase.auth.getUser();
         if (user?.user_metadata?.shiprocket_config) {
             config = user.user_metadata.shiprocket_config;
         }
      } catch (e) { console.error("Error loading config from metadata", e); }

      // 2. Fallback to LocalStorage
      if (!config) {
        const saved = localStorage.getItem("shiprocket_config");
        if (saved) {
          try {
            config = JSON.parse(saved);
          } catch (e) {
            console.error("Failed to parse saved config:", e);
          }
        }
      }

      // 3. Process Config (Validate & Refresh)
      if (config) {
          if (!config.pickupLocation) config.pickupLocation = "Primary";

          // Check expiry
          if (config.tokenExpiry && Date.now() > config.tokenExpiry) {
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

                    // Save updated config to both storage and metadata
                    localStorage.setItem("shiprocket_config", JSON.stringify(updatedConfig));

                    try {
                      const { createClient } = await import("@/src/lib/supabase/client");
                      const supabase = createClient();
                      await supabase.auth.updateUser({ data: { shiprocket_config: updatedConfig } });
                    } catch (e) { console.error("Failed to update metadata", e); }

                    setShiprocketConfig(updatedConfig);
                    return;
                  }
                } catch (error) {
                  console.error("Failed to refresh token:", error);
                }
             }
             // Expired and refresh failed
             setShiprocketConfig({ ...config, token: undefined });
          } else {
             setShiprocketConfig(config);
          }
          return;
      }
      // 4. Fallback to server-side authentication
      // We no longer rely on NEXT_PUBLIC_SHIPROCKET_EMAIL/PASSWORD for security.
      // The server `/api/shiprocket/auth` securely uses the backend .env values if we send an empty body.
      try {
        const response = await fetch("/api/shiprocket/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), // Forces server to use its own secure credentials
        });
        if (response.ok) {
          const { token } = await response.json();
          if (token) {
            const config = {
              email: "Server Authenticated",
              password: "***",
              token,
              tokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
              pickupLocation: "Primary",
            };
            localStorage.setItem("shiprocket_config", JSON.stringify(config));
            setShiprocketConfig(config);
          }
        }
      } catch (error) {
        console.error("Failed to get Shiprocket token from server config:", error);
      }
    };

    loadShiprocketConfig();
  }, [id]);



  const handlePrint = () => {
    window.print();
  };

  // Print shipping label from Shiprocket
  const handlePrintShippingLabel = async () => {
    if (!order || !shiprocketConfig?.token) {
      toast.error("Shiprocket not configured");
      return;
    }

    // Check if we have a shipment ID
    const shipmentId = order.shiprocket_shipment_id;

    if (!shipmentId) {
      toast.error("No shipment ID found. Please create a shipment first.");
      return;
    }

    setPrintingLabel(true);
    try {
      const response = await fetch("/api/shiprocket/generate-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: shiprocketConfig.token,
          shipmentIds: [shipmentId],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate label");
      }

      // Shiprocket returns label_url or label_created with a URL
      const labelUrl = result.label_url || result.label_created || result.response?.label_url;

      if (labelUrl) {
        // Open the label in a new tab for printing
        window.open(labelUrl, "_blank");
        toast.success("Shipping label opened in new tab");
      } else {
        toast.error("Label URL not found in response. Please try generating from Shiprocket dashboard.");
        console.error("Label response:", result);
      }
    } catch (error: any) {
      console.error("Print label error:", error);
      toast.error(error.message || "Failed to generate shipping label");
    } finally {
      setPrintingLabel(false);
    }
  };

  // Fetch available couriers
  const fetchCouriers = async () => {
    if (!order || !shiprocketConfig?.token) return;

    setLoadingRates(true);
    setCouriers([]);
    setSelectedCourier(null);

    try {
      const shippingAddress = order.shipping_address as any;
      if (!shippingAddress?.postalCode && !shippingAddress?.zip) {
        toast.error("Delivery pincode is missing");
        return;
      }

      // 1. Get Pickup Location Details (to find pickup pincode)
      const pickupRes = await fetch(`/api/shiprocket/pickup-locations?token=${shiprocketConfig.token}`);
      const pickupData = await pickupRes.json();

      console.log("Pickup Locations Response:", pickupData);

      let pickupPincode = "";
      // Shiprocket response structure: { data: { shipping_address: [...] } } or { data: [...] } depending on version/endpoint wrapper
      const locations = pickupData.data?.shipping_address || pickupData.data || [];

      if (Array.isArray(locations)) {
        const locationName = shiprocketConfig.pickupLocation || "Primary";
        // Try exact match first, then case-insensitive
        const location = locations.find((l: any) => l.pickup_location === locationName) ||
                         locations.find((l: any) => l.pickup_location.toLowerCase() === locationName.toLowerCase()) ||
                         locations[0];

        if (location) {
          pickupPincode = location.pin_code || location.pincode;
        }
      }

      if (!pickupPincode) {
        console.error("Failed to find pickup pincode. Locations:", locations);
        toast.error(`Could not determine pickup location pincode. Please check your Shiprocket Pickup Location settings.`);
        return;
      }

      // 2. Calculate Weight
      const orderItems = order.items || [];
      const totalWeight = orderItems.reduce((sum: number, item: any) => {
        return sum + (item.weight || 0.5) * (item.quantity || 1);
      }, 0) || 0.5;

      // 3. Check Serviceability
      const serviceabilityRes = await fetch("/api/shiprocket/serviceability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: shiprocketConfig.token,
          pickup_pincode: pickupPincode,
          delivery_pincode: shippingAddress.postalCode || shippingAddress.zip,
          weight: totalWeight,
          cod: order.payment_method === "cod" ? 1 : 0,
        }),
      });

      const serviceData = await serviceabilityRes.json();

      if (serviceData.data?.available_courier_companies) {
        // Sort by rate (cheapest first)
        const sorted = serviceData.data.available_courier_companies.sort((a: any, b: any) => a.rate - b.rate);
        setCouriers(sorted);
        if (sorted.length > 0) {
          setSelectedCourier(sorted[0]);
        }
      } else {
        toast.error("No courier service available for this route");
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
      toast.error("Failed to fetch courier rates");
    } finally {
      setLoadingRates(false);
    }
  };

  const handleCreateShipment = async (courierId?: number) => {
    if (!order || !shiprocketConfig?.token) {
      toast.error("Please configure Shiprocket settings first");
      return;
    }

    // Open Modal flow if no courier selected yet
    if (!courierId && !showShipmentModal) {
      setShowShipmentModal(true);
      fetchCouriers();
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
        streetAddress?: string;
        city?: string;
        state?: string;
        zip?: string;
        postalCode?: string;
        country?: string;
      } | null;

      if (!shippingAddress) {
        toast.error("Shipping address is missing");
        setCreatingShipment(false);
        return;
      }

      // Handle both naming conventions
      const addressLine = shippingAddress.address || shippingAddress.streetAddress || "";
      const postalCode = shippingAddress.zip || shippingAddress.postalCode || "";

      // Customer email: required for Shiprocket to send order updates (dispatch, delivery, etc.)
      const billingAddress = order.billing_address as { email?: string } | null;
      const customerEmail = (
        shippingAddress.email ||
        (order as any).email ||
        billingAddress?.email ||
        ""
      ).trim();

      if (!customerEmail) {
        toast.error(
          "Customer email is required so Shiprocket can send order updates (shipped, delivered). Add email in shipping address or order details."
        );
        setCreatingShipment(false);
        return;
      }

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

      // Calculate total weight
      const totalWeight = orderItems.reduce((sum: number, item: any) => {
        return sum + (item.weight || 0.5) * (item.quantity || 1);
      }, 0) || 0.5;

      // Calculate estimated package dimensions
      const itemCount = orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      const baseLength = 20;
      const baseBreadth = 15;
      const baseHeight = 10;
      const additionalSpace = Math.floor(itemCount / 3) * 5;
      const packageLength = Math.min(baseLength + additionalSpace, 60);
      const packageBreadth = Math.min(baseBreadth + Math.floor(additionalSpace / 2), 40);
      const packageHeight = Math.min(baseHeight + Math.floor(additionalSpace / 2), 30);

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
        billing_email: customerEmail,
        billing_phone: shippingAddress.phone || "",
        shipping_is_billing: true,
        shipping_email: customerEmail,
        order_items: shiprocketItems,
        payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
        sub_total: Number(order.subtotal) || 0,
        weight: totalWeight,
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
          courier_id: courierId,
        }),
      });

      const result = await response.json();

      console.log("Shiprocket full response:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.error || result.message || `Failed (Status: ${response.status})`);
      }

      // Check for success
      const srOrderId = result.order_id || result.payload?.order_id;
      const shipmentId = result.shipment_id || result.payload?.shipment_id;
      const awbCode = result.awb_code || result.payload?.awb_code;

      if (srOrderId || shipmentId) {
        // Save Shiprocket IDs to the database
        await updateShiprocketIds(order.id, srOrderId || null, shipmentId || null);

        if (awbCode) {
          await updateOrderTrackingNumber(order.id, awbCode);
          await updateOrderStatus(order.id, "shipped");
          toast.success(`Shipment created with Courier! AWB: ${awbCode}`);
          setOrder({
            ...order,
            tracking_number: awbCode,
            status: "shipped",
            shiprocket_order_id: srOrderId || null,
            shiprocket_shipment_id: shipmentId || null
          });
          setShowShipmentModal(false);
          // Customer shipment emails (shipped, delivered) are sent by Shiprocket when billing_email/billing_phone are set at order creation.
        } else {
          const trackingRef = `SR-${shipmentId || srOrderId}`;
          await updateOrderTrackingNumber(order.id, trackingRef);
          await updateOrderStatus(order.id, "processing");
          toast.success(`Order created in Shiprocket (ID: ${srOrderId}). Courier assignment failed/pending.`);
          setOrder({
            ...order,
            tracking_number: trackingRef,
            status: "processing",
            shiprocket_order_id: srOrderId || null,
            shiprocket_shipment_id: shipmentId || null
          });
          setShowShipmentModal(false);
        }
      } else {
        toast.warning("Shiprocket request completed but no ID returned. Check dashboard.");
        setShowShipmentModal(false);
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

  const shippingAddress = order.shipping_address as any; // simplified type for render
  const orderItems = order.items || [];

  return (
    <div className="space-y-6">
      <Dialog open={showShipmentModal} onOpenChange={setShowShipmentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Courier Service</DialogTitle>
            <DialogDescription>
              Choose the best courier partner for this shipment.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingRates ? (
               <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <Loader2 className="h-8 w-8 animate-spin text-[#009744]" />
                 <p className="text-sm text-muted-foreground">Fetching live rates from Shiprocket...</p>
               </div>
            ) : couriers.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">
                 No couriers available. Try checking pickup pincode or weight.
                 <br/>
                 <Button variant="link" onClick={fetchCouriers} className="mt-2 text-[#009744]">Retry Serviceability Check</Button>
               </div>
            ) : (
               <ScrollArea className="h-[400px] pr-4">
                 <RadioGroup
                    value={String(selectedCourier?.courier_company_id || "")}
                    onValueChange={(val) => {
                       const courier = couriers.find(c => String(c.courier_company_id) === String(val));
                       setSelectedCourier(courier);
                    }}
                 >
                   <div className="space-y-3">
                     {couriers.map((courier) => (
                       <div key={courier.courier_company_id}
                            onClick={() => setSelectedCourier(courier)}
                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50
                            ${selectedCourier?.courier_company_id === courier.courier_company_id ? 'border-[#009744] bg-green-50/50' : 'border-gray-200'}`}>
                         <div className="flex items-center gap-3">
                           <RadioGroupItem value={String(courier.courier_company_id)} id={`c-${courier.courier_company_id}`} className="mt-1" />
                           <Label htmlFor={`c-${courier.courier_company_id}`} className="cursor-pointer">
                             <div className="font-semibold text-base">{courier.courier_name}</div>
                             <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                               <span className="flex items-center gap-1">
                                 {courier.rating} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                               </span>
                               <span>•</span>
                               <span>{courier.estimated_delivery_days} Days ETA</span>
                             </div>
                           </Label>
                         </div>
                         <div className="text-right">
                           <div className="font-bold text-lg text-[#009744]">{formatCurrency(courier.rate)}</div>
                           {courier.cod === 1 && <div className="text-[10px] text-muted-foreground">COD Available</div>}
                         </div>
                       </div>
                     ))}
                   </div>
                 </RadioGroup>
               </ScrollArea>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="outline" onClick={() => setShowShipmentModal(false)}>Cancel</Button>
             <Button
               onClick={() => handleCreateShipment(selectedCourier?.courier_company_id)}
               disabled={!selectedCourier || creatingShipment}
               className="bg-[#009744] hover:bg-[#008339]"
             >
               {creatingShipment ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Creating...
                 </>
               ) : (
                 <>
                   Ship via {selectedCourier?.courier_name || 'Selected'}
                 </>
               )}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({orderItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items in this order</p>
                ) : (
                  orderItems.map((item: any) => (
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
              <div className="relative">
                <div className="flex justify-between items-center">
                  {[
                    { status: "pending", label: "Paid", icon: Clock },
                    { status: "processing", label: "Processed", icon: Package },
                    { status: "shipped", label: "Shipped", icon: Truck },
                    { status: "delivered", label: "Delivered", icon: CheckCircle2 },
                  ].map((step, index) => {
                    const isActive = order.status === step.status;
                    return (
                      <div key={step.status} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                             isActive
                              ? "bg-[#009744] text-white shadow-lg"
                              : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                          }`}
                        >
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs mt-2 font-medium text-center text-gray-600">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.tracking_number ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Truck className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">
                          {order.tracking_number.startsWith('SR-') ? 'Order Registered (Awaiting AWB)' : 'Shipment Dispatched'}
                        </p>
                        <p className="text-lg font-bold text-green-800 font-mono">
                          {order.tracking_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Print Shipping Label Button */}
                      {order.shiprocket_shipment_id && !order.tracking_number.startsWith('SR-') && (
                        <Button
                          variant="outline"
                          onClick={handlePrintShippingLabel}
                          disabled={printingLabel}
                          className="border-[#009744] text-[#009744] hover:bg-[#009744]/10"
                        >
                          {printingLabel ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Label
                            </>
                          )}
                        </Button>
                      )}
                      {/* Track Shipment Button */}
                      <Button
                        variant="default"
                        className={`${order.tracking_number.startsWith('SR-') ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        asChild={!order.tracking_number.startsWith('SR-')}
                        disabled={order.tracking_number.startsWith('SR-')}
                      >
                        {order.tracking_number.startsWith('SR-') ? (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            AWB Pending
                          </>
                        ) : (
                          <a
                            href={getShiprocketTrackingURL(order.tracking_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Track Shipment
                          </a>
                        )}
                      </Button>
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
                    <Button
                      onClick={() => handleCreateShipment()}
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
                 <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                   <p className="text-sm text-gray-500 mb-2">Configure Shiprocket to enable shipping</p>
                   <Button variant="outline" asChild>
                     <Link href="/admin/settings/shiprocket">Go to Settings</Link>
                   </Button>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <div className="font-medium">
                  {shippingAddress?.firstName} {shippingAddress?.lastName}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <div className="font-medium break-all">{shippingAddress?.email || order.email}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <div className="font-medium">{shippingAddress?.phone}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed">
                <p>{shippingAddress?.address || shippingAddress?.streetAddress}</p>
                <p>{shippingAddress?.apartment}</p>
                <p>
                  {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zip || shippingAddress?.postalCode}
                </p>
                <p>{shippingAddress?.country}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Payment Method</Label>
                <div className="font-medium capitalize">{order.payment_method}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Payment Status</Label>
                <Badge variant={order.payment_status === "paid" ? "default" : "destructive"}>
                  {order.payment_status}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(Number(order.subtotal || 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(Number(order.shipping_cost || 0))}</span>
                </div>
                 {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(Number(order.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(Number(order.tax || 0))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.total_amount || order.total || 0))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
