"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Truck, ExternalLink, Printer, FileText, X, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { toast } from "sonner";
import { getShiprocketTrackingURL } from "@/src/lib/shiprocket-client";

const STORAGE_KEY = "shiprocket_config";

export default function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [config, setConfig] = useState<any>(null);
  const [shipment, setShipment] = useState<any>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [charges, setCharges] = useState<any>(null);
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
          if (parsed.token) {
            fetchShipmentDetails(parsed.token);
            fetchTracking(parsed.token);
            fetchCharges(parsed.token);
          }
        } catch (e) {
          console.error("Failed to parse config:", e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, [id]);

  const fetchShipmentDetails = async (token: string) => {
    try {
      const response = await fetch(`/api/shiprocket/shipments?token=${token}&shipmentId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setShipment(data.data || data);
      }
    } catch (error) {
      console.error("Error fetching shipment:", error);
      toast.error("Failed to load shipment details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async (token: string) => {
    try {
      const response = await fetch(`/api/shiprocket/tracking?token=${token}&shipmentId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setTracking(data);
      }
    } catch (error) {
      console.error("Error fetching tracking:", error);
    }
  };

  const fetchCharges = async (token: string) => {
    try {
      const response = await fetch(`/api/shiprocket/charges?token=${token}&shipmentId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setCharges(data);
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
    }
  };

  const handleGenerateLabel = async () => {
    setGeneratingLabel(true);
    try {
      const response = await fetch("/api/shiprocket/generate-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: config.token,
          shipmentIds: [parseInt(id)],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.label_url) {
          window.open(data.label_url, "_blank");
          toast.success("Label generated successfully");
        }
      } else {
        toast.error("Failed to generate label");
      }
    } catch (error) {
      console.error("Error generating label:", error);
      toast.error("Failed to generate label");
    } finally {
      setGeneratingLabel(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const response = await fetch("/api/shiprocket/generate-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: config.token,
          shipmentIds: [parseInt(id)],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.invoice_url) {
          window.open(data.invoice_url, "_blank");
          toast.success("Invoice generated successfully");
        }
      } else {
        toast.error("Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!shipment?.awb_code) {
      toast.error("AWB code not available");
      return;
    }

    if (!confirm("Are you sure you want to cancel this shipment?")) return;

    try {
      const response = await fetch("/api/shiprocket/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: config.token,
          awbCode: shipment.awb_code,
        }),
      });

      if (response.ok) {
        toast.success("Shipment cancelled successfully");
        fetchShipmentDetails(config.token);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to cancel shipment");
      }
    } catch (error) {
      console.error("Error cancelling shipment:", error);
      toast.error("Failed to cancel shipment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config?.token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipment Details</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Shiprocket Not Configured</h3>
              <Button asChild className="mt-4">
                <Link href="/admin/settings/shiprocket">Configure Shiprocket</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/shiprocket/shipments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Shipment not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      NEW: { variant: "outline", label: "New" },
      READY_TO_SHIP: { variant: "secondary", label: "Ready to Ship" },
      IN_TRANSIT: { variant: "default", label: "In Transit" },
      OUT_FOR_DELIVERY: { variant: "default", label: "Out for Delivery" },
      DELIVERED: { variant: "default", label: "Delivered" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
      RTO: { variant: "destructive", label: "RTO" },
    };
    const statusInfo = statusMap[status] || { variant: "outline" as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/shiprocket/shipments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Shipment Details</h1>
          <p className="text-muted-foreground">
            Shipment ID: {shipment.shipment_id || id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {shipment.awb_code && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateLabel}
                disabled={generatingLabel}
              >
                {generatingLabel ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                Label
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice}
              >
                {generatingInvoice ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Invoice
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={getShiprocketTrackingURL(shipment.awb_code)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Track
                </a>
              </Button>
            </>
          )}
          {shipment.status !== "DELIVERED" && shipment.status !== "CANCELLED" && shipment.awb_code && (
            <Button variant="destructive" size="sm" onClick={handleCancelShipment}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Shipment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-medium">{shipment.order_number || shipment.channel_order_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AWB Code</p>
                  <p className="font-mono text-sm">{shipment.awb_code || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(shipment.status || "NEW")}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Courier</p>
                  <p className="font-medium">{shipment.courier_name || "Not assigned"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          {tracking?.tracking_data && (
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tracking.tracking_data.shipment_track?.map((event: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        {index < tracking.tracking_data.shipment_track.length - 1 && (
                          <div className="w-0.5 h-full bg-muted mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{event.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.location} • {event.tracking_date} {event.tracking_time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{shipment.customer_name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{shipment.customer_email || ""}</p>
                <p className="text-sm text-muted-foreground">{shipment.customer_phone || ""}</p>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium mb-1">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.delivery_address || "N/A"}
                    <br />
                    {shipment.delivery_city}, {shipment.delivery_state} {shipment.delivery_pincode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Charges */}
          {charges && (
            <Card>
              <CardHeader>
                <CardTitle>Charges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {charges.data?.charges && Object.entries(charges.data.charges).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="font-medium">₹{value?.toFixed(2) || "0.00"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {shipment.awb_code && (
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={getShiprocketTrackingURL(shipment.awb_code)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Shiprocket
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  fetchShipmentDetails(config.token);
                  fetchTracking(config.token);
                  fetchCharges(config.token);
                  toast.success("Refreshed");
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
