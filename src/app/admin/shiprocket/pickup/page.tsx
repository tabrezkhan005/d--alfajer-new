"use client";

import { useState, useEffect } from "react";
import { Truck, Calendar, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

const STORAGE_KEY = "shiprocket_config";

export default function PickupPage() {
  const [config, setConfig] = useState<any>(null);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [packageCount, setPackageCount] = useState("1");
  const [pickupLocationId, setPickupLocationId] = useState("");
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
          if (parsed.token) {
            fetchPickupLocations(parsed.token);
          }
        } catch (e) {
          console.error("Failed to parse config:", e);
        }
      }
    }

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPickupDate(tomorrow.toISOString().split("T")[0]);
    setPickupTime("10:00");
  }, []);

  const fetchPickupLocations = async (token: string) => {
    setLoadingLocations(true);
    try {
      const response = await fetch(`/api/shiprocket/pickup-locations?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setPickupLocations(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching pickup locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleRequestPickup = async () => {
    if (!pickupDate || !pickupTime || !packageCount) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!config?.token) {
      toast.error("Please configure Shiprocket first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/shiprocket/request-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: config.token,
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          expected_package_count: parseInt(packageCount),
          ...(pickupLocationId && { pickup_location_id: parseInt(pickupLocationId) }),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Pickup requested successfully!");
        // Reset form
        setPickupDate("");
        setPickupTime("10:00");
        setPackageCount("1");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to request pickup");
      }
    } catch (error) {
      console.error("Pickup request error:", error);
      toast.error("Failed to request pickup");
    } finally {
      setLoading(false);
    }
  };

  if (!config?.token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request Pickup</h1>
          <p className="text-muted-foreground">Schedule package pickup from your location</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Shiprocket Not Configured</h3>
              <p className="text-muted-foreground mb-6">
                Please configure your Shiprocket credentials first
              </p>
              <Button asChild>
                <a href="/admin/settings/shiprocket">Configure Shiprocket</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Pickup</h1>
        <p className="text-muted-foreground">
          Schedule a pickup for your ready-to-ship packages
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pickup Details</CardTitle>
            <CardDescription>
              Enter pickup date, time, and package count
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-date">Pickup Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pickup-date"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup-time">Pickup Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pickup-time"
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="package-count">Expected Package Count *</Label>
              <Input
                id="package-count"
                type="number"
                min="1"
                value={packageCount}
                onChange={(e) => setPackageCount(e.target.value)}
                placeholder="1"
              />
            </div>

            {pickupLocations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="pickup-location">Pickup Location (Optional)</Label>
                <select
                  id="pickup-location"
                  value={pickupLocationId}
                  onChange={(e) => setPickupLocationId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Use Default Location</option>
                  {pickupLocations.map((location: any) => {
                    // Try different field names for location ID
                    const locId = location.pickup_location_id || location.id || location.location_id;
                    const locName = location.pickup_location_name || location.name || location.location_name || `Location ${locId}`;
                    return (
                      <option key={locId} value={locId}>
                        {locName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <Button
              onClick={handleRequestPickup}
              disabled={loading || loadingLocations}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Request Pickup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pickup Information</CardTitle>
            <CardDescription>Guidelines for pickup requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Pickup requests should be made at least 24 hours in advance</li>
                  <li>Ensure all packages are ready and properly labeled before pickup</li>
                  <li>Package count should match the actual number of shipments</li>
                  <li>Pickup time should be during business hours (9 AM - 6 PM)</li>
                  <li>You will receive a confirmation once the pickup is scheduled</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
