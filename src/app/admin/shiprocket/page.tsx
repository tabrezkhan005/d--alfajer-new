"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, Clock, AlertCircle, TrendingUp, Download, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "shiprocket_config";

interface ShiprocketStats {
  totalShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  cancelledShipments: number;
}

export default function ShiprocketDashboardPage() {
  const [config, setConfig] = useState<any>(null);
  const [stats, setStats] = useState<ShiprocketStats>({
    totalShipments: 0,
    pendingShipments: 0,
    inTransitShipments: 0,
    deliveredShipments: 0,
    cancelledShipments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentShipments, setRecentShipments] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
          fetchShipmentData(parsed.token);
          // fetchStats(); // Removed as we use API data now
        } catch (e) {
          console.error("Failed to parse config:", e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, []);

  /* Removed fetchStats as we use API data now */

  const refreshToken = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/shiprocket/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  };

  const fetchShipmentData = async (token: string, isRetry = false) => {
    try {
      setLoading(true);
      // Fetch more items to get better stats overview
      const response = await fetch(`/api/shiprocket/shipments?token=${token}&per_page=100`);

      if (response.status === 401 && !isRetry && config?.email && config?.password) {
        // Token expired, try refreshing
        console.log("Token expired, attempting refresh...");
        const newToken = await refreshToken(config.email, config.password);

        if (newToken) {
          // Update local config
          const newConfig = { ...config, token: newToken };
          setConfig(newConfig);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));

          // Retry with new token
          return fetchShipmentData(newToken, true);
        } else {
          toast.error("Session expired. Please re-login to Shiprocket.");
          // Clear invalid token? Maybe user can fix in settings.
        }
        return;
      }

      if (response.ok) {
        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error("Failed to parse shipments data");
        }

        // Shiprocket shipments endpoint returns structure: { data: [...], meta: { pagination: { total: ... } } }
        if (data && data.data && Array.isArray(data.data)) {
          setRecentShipments(data.data.slice(0, 10)); // Show only 10 recent

          // Calculate stats from the API response
          const totalFromApi = data.meta?.pagination?.total || data.data.length;

          const newStats: ShiprocketStats = {
             totalShipments: totalFromApi,
             pendingShipments: data.data.filter((s: any) =>
                s.status === "NEW" || s.status === "AWB ASSIGNED" || s.status === "READY TO SHIP" || s.status === "PICKUP SCHEDULED" || s.status_code === 6 || s.status_code === 13 || s.status_code === 15
             ).length,
             inTransitShipments: data.data.filter((s: any) =>
                s.status === "SHIPPED" || s.status === "IN TRANSIT" || s.status === "OUT FOR DELIVERY" || s.status === "REACHED AT DESTINATION" || s.status_code === 17 || s.status_code === 18 || s.status_code === 42
             ).length,
             deliveredShipments: data.data.filter((s: any) =>
                s.status === "DELIVERED" || s.status_code === 7
             ).length,
             cancelledShipments: data.data.filter((s: any) =>
                s.status === "CANCELLED" || s.status === "RTO INITIATED" || s.status === "RTO DELIVERED" || s.status_code === 8
             ).length,
          };
          setStats(newStats);
        } else {
          console.error("Invalid shipments response data:", data);
          toast.error("Invalid shipment data format received");
        }
      } else {
        // Handle non-401 errors
        let errorData: any = {};
        let rawText = "";
        try {
          rawText = await response.text();
          if (rawText) {
            errorData = JSON.parse(rawText);
          }
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }

        console.error("Fetch shipments error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          rawText,
          message: errorData.error || errorData.message || rawText || response.statusText || "Failed to load shipment data"
        });

        toast.error(errorData.error || errorData.message || response.statusText || "Failed to load shipment data");
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipment data");
    } finally {
      if (!isRetry) setLoading(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Shiprocket Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your shipping operations with Shiprocket
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Shiprocket Not Configured</h3>
              <p className="text-muted-foreground mb-6">
                Please configure your Shiprocket credentials to get started
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shiprocket Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your shipping operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/shiprocket/shipments">
              <Package className="mr-2 h-4 w-4" />
              All Shipments
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/orders">
              <Plus className="mr-2 h-4 w-4" />
              Create Shipment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransitShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveredShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelledShipments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/shiprocket/analytics">
          <Card className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10">
                <TrendingUp className="h-24 w-24" />
             </div>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Analytics
              </CardTitle>
              <CardDescription>Shipping costs & performance</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/shiprocket/cod">
          <Card className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10">
                <Download className="h-24 w-24" />
             </div>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4 text-green-600" />
                COD Remittance
              </CardTitle>
              <CardDescription>Track payments & settlements</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/shiprocket/serviceability">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Serviceability Check</CardTitle>
              <CardDescription>Check if courier can deliver</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/shiprocket/pickup">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Request Pickup</CardTitle>
              <CardDescription>Schedule package pickup</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/shiprocket/returns">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Return Orders</CardTitle>
              <CardDescription>Manage return shipments</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/orders">
           <Card className="cursor-pointer hover:shadow-md transition-shadow bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base text-primary">Bulk Shipment</CardTitle>
              <CardDescription>Process multiple orders</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Shipments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
          <CardDescription>Latest shipments from Shiprocket</CardDescription>
        </CardHeader>
        <CardContent>
          {recentShipments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shipments found
            </div>
          ) : (
            <div className="space-y-4">
              {recentShipments.map((shipment: any, index: number) => (
                <div
                  key={shipment.shipment_id || shipment.order_id || shipment.id || `shipment-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {shipment.status || "NEW"}
                      </Badge>
                      <span className="font-medium">
                        {shipment.order_number || shipment.channel_order_id}
                      </span>
                      {shipment.awb_code && (
                        <span className="text-sm text-muted-foreground font-mono">
                          AWB: {shipment.awb_code}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {shipment.customer_name} • {shipment.delivery_city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {shipment.awb_code && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://shiprocket.co/tracking/${shipment.awb_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Track
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/shiprocket/shipments/${shipment.shipment_id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
