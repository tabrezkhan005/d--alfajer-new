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
        } catch (e) {
          console.error("Failed to parse config:", e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchShipmentData = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shiprocket/shipments?token=${token}&per_page=10`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setRecentShipments(data.data);
          // Calculate stats
          const stats: ShiprocketStats = {
            totalShipments: data.data.length,
            pendingShipments: data.data.filter((s: any) => s.status === "NEW" || s.status === "READY_TO_SHIP").length,
            inTransitShipments: data.data.filter((s: any) => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length,
            deliveredShipments: data.data.filter((s: any) => s.status === "DELIVERED").length,
            cancelledShipments: data.data.filter((s: any) => s.status === "CANCELLED" || s.status === "RTO").length,
          };
          setStats(stats);
        }
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipment data");
    } finally {
      setLoading(false);
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow" asChild>
          <Link href="/admin/shiprocket/serviceability">
            <CardHeader>
              <CardTitle className="text-base">Serviceability Check</CardTitle>
              <CardDescription>Check if courier can deliver</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" asChild>
          <Link href="/admin/shiprocket/rate-calculator">
            <CardHeader>
              <CardTitle className="text-base">Rate Calculator</CardTitle>
              <CardDescription>Calculate shipping rates</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" asChild>
          <Link href="/admin/shiprocket/pickup">
            <CardHeader>
              <CardTitle className="text-base">Request Pickup</CardTitle>
              <CardDescription>Schedule package pickup</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" asChild>
          <Link href="/admin/shiprocket/returns">
            <CardHeader>
              <CardTitle className="text-base">Return Orders</CardTitle>
              <CardDescription>Manage return shipments</CardDescription>
            </CardHeader>
          </Link>
        </Card>
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
              {recentShipments.map((shipment: any) => (
                <div
                  key={shipment.shipment_id}
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
