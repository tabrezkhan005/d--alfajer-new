"use client";

import { useState, useEffect } from "react";
import { Package, Search, Filter, Download, Eye, X, FileText, Printer, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { DataTable } from "@/src/components/admin/data-table";
import { toast } from "sonner";
import Link from "next/link";
import { getShiprocketTrackingURL } from "@/src/lib/shiprocket-client";

const STORAGE_KEY = "shiprocket_config";

export default function ShipmentsPage() {
  const [config, setConfig] = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShipments, setSelectedShipments] = useState<number[]>([]);
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const [generatingManifest, setGeneratingManifest] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
          if (parsed.token) {
            fetchShipments(parsed.token);
          }
        } catch (e) {
          console.error("Failed to parse config:", e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchShipments = async (token: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        token,
        per_page: "50",
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const response = await fetch(`/api/shiprocket/shipments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setShipments(data.data);
        }
      } else {
        toast.error("Failed to load shipments");
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config?.token) {
      fetchShipments(config.token);
    }
  }, [statusFilter, config]);

  const handleGenerateLabel = async () => {
    if (selectedShipments.length === 0) {
      toast.error("Please select at least one shipment");
      return;
    }

    setGeneratingLabel(true);
    try {
      const response = await fetch("/api/shiprocket/generate-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: config.token,
          shipmentIds: selectedShipments,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.label_url) {
          window.open(data.label_url, "_blank");
          toast.success("Label generated successfully");
        } else {
          toast.error("Failed to generate label");
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

  const handleGenerateManifest = async () => {
    if (selectedShipments.length === 0) {
      toast.error("Please select at least one shipment");
      return;
    }

    setGeneratingManifest(true);
    try {
      const response = await fetch("/api/shiprocket/generate-manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: config.token,
          shipmentIds: selectedShipments,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.manifest_url) {
          window.open(data.manifest_url, "_blank");
          toast.success("Manifest generated successfully");
        } else {
          toast.error("Failed to generate manifest");
        }
      } else {
        toast.error("Failed to generate manifest");
      }
    } catch (error) {
      console.error("Error generating manifest:", error);
      toast.error("Failed to generate manifest");
    } finally {
      setGeneratingManifest(false);
    }
  };

  const handleCancelShipment = async (awbCode: string) => {
    if (!confirm("Are you sure you want to cancel this shipment?")) return;

    try {
      const response = await fetch("/api/shiprocket/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: config.token,
          awbCode,
        }),
      });

      if (response.ok) {
        toast.success("Shipment cancelled successfully");
        fetchShipments(config.token);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to cancel shipment");
      }
    } catch (error) {
      console.error("Error cancelling shipment:", error);
      toast.error("Failed to cancel shipment");
    }
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      !searchQuery ||
      shipment.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.awb_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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

  const columns = [
    {
      key: "order_number",
      header: "Order Number",
      render: (row: any) => (
        <div className="font-medium">{row.order_number || row.channel_order_id || "N/A"}</div>
      ),
    },
    {
      key: "awb_code",
      header: "AWB Code",
      render: (row: any) => (
        <div className="font-mono text-sm">
          {row.awb_code || <span className="text-muted-foreground">Not assigned</span>}
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.customer_name || "N/A"}</div>
          <div className="text-xs text-muted-foreground">{row.delivery_city || ""}</div>
        </div>
      ),
    },
    {
      key: "courier",
      header: "Courier",
      render: (row: any) => <div>{row.courier_name || "Not assigned"}</div>,
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => getStatusBadge(row.status || "NEW"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/shiprocket/shipments/${row.shipment_id || row.order_id || row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {row.awb_code && (
            <Button variant="ghost" size="sm" asChild>
              <a
                href={getShiprocketTrackingURL(row.awb_code)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          {row.status !== "DELIVERED" && row.status !== "CANCELLED" && row.awb_code && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancelShipment(row.awb_code)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

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
          <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">Manage your Shiprocket shipments</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Shiprocket Not Configured</h3>
              <p className="text-muted-foreground mb-6">
                Please configure your Shiprocket credentials first
              </p>
              <Button asChild>
                <Link href="/admin/settings/shiprocket">Configure Shiprocket</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">Manage and track all Shiprocket shipments</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedShipments.length > 0 && (
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
                Generate Label
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateManifest}
                disabled={generatingManifest}
              >
                {generatingManifest ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Generate Manifest
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, AWB, or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="READY_TO_SHIP">Ready to Ship</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="RTO">RTO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      {filteredShipments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No shipments found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          data={filteredShipments.map((s: any) => ({ ...s, id: s.shipment_id?.toString() || s.order_number || Math.random().toString() }))}
          columns={columns}
          searchKey="order_number"
          selectable={true}
          onSelectionChange={(selected) => {
            setSelectedShipments(selected.map((s: any) => s.shipment_id).filter(Boolean));
          }}
        />
      )}
    </div>
  );
}
