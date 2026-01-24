"use client";

import { useState, useEffect } from "react";
import { Package, Save, Eye, EyeOff, Loader2, RefreshCw, MapPin, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

const STORAGE_KEY = "shiprocket_config";

interface PickupLocation {
  id: number;
  pickup_location: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  address_2?: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  lat?: string;
  long?: string;
  status?: number;
}

interface ShiprocketConfig {
  email: string;
  password: string;
  token?: string;
  tokenExpiry?: number;
  pickupLocation?: string;
  pickupLocationId?: number;
}

export default function ShiprocketSettingsPage() {
  const [config, setConfig] = useState<ShiprocketConfig>({
    email: "",
    password: "",
    pickupLocation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "unknown">("unknown");

  // Load saved configuration and fetch pickup locations
  useEffect(() => {
    const loadConfig = async () => {
      // Try to load from Supabase User Metadata first (Server/Cross-Browser)
      const { createClient } = await import("@/src/lib/supabase/client");
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      const metadataConfig = user?.user_metadata?.shiprocket_config;

      if (metadataConfig) {
        setConfig(metadataConfig);
        if (metadataConfig.token) {
          fetchPickupLocations(metadataConfig.token);
          setConnectionStatus("connected");
        }
      } else {
        // Fallback to localStorage for backward compatibility
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setConfig(parsed);
              if (parsed.token) {
                fetchPickupLocations(parsed.token);
                setConnectionStatus("connected");
              }
            } catch (e) {
              console.error("Failed to parse saved config:", e);
            }
          }
        }
      }
    };

    loadConfig();
  }, []);

  const fetchPickupLocations = async (token: string) => {
    setLoadingLocations(true);
    try {
      const response = await fetch(`/api/shiprocket/pickup-locations?token=${encodeURIComponent(token)}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Failed to fetch pickup locations:", error);
        if (response.status === 401) {
          setConnectionStatus("disconnected");
          toast.error("Token expired. Please authenticate again.");
        }
        return;
      }

      const data = await response.json();

      // Handle different response formats from Shiprocket API
      let locations: PickupLocation[] = [];
      if (data.data?.shipping_address) {
        locations = data.data.shipping_address;
      } else if (Array.isArray(data.data)) {
        locations = data.data;
      } else if (Array.isArray(data)) {
        locations = data;
      }

      setPickupLocations(locations);
      setConnectionStatus("connected");

      // Auto-select first location if none selected
      if (locations.length > 0 && !config.pickupLocation) {
        const firstLocation = locations[0];
        setConfig(prev => ({
          ...prev,
          pickupLocation: firstLocation.pickup_location,
          pickupLocationId: firstLocation.id,
        }));
      }
    } catch (error) {
      console.error("Error fetching pickup locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleSave = async () => {
    if (!config.email || !config.password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      // Test connection by getting token
      const response = await fetch("/api/shiprocket/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: config.email,
          password: config.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to authenticate");
      }

      const { token } = await response.json();

      // Fetch pickup locations with new token
      await fetchPickupLocations(token);

      // Save config to User Metadata (Persist DB)
      const configToSave: ShiprocketConfig = {
        ...config,
        token,
        tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      const { createClient } = await import("@/src/lib/supabase/client");
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        data: { shiprocket_config: configToSave }
      });

      if (updateError) {
         console.warn("Failed to save to user metadata, falling back to local storage", updateError);
         localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
      } else {
         // Also update local storage for redundancy/latency
         localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
      }

      setConfig(configToSave);
      setConnectionStatus("connected");
      toast.success("Shiprocket credentials saved!");
    } catch (error: any) {
      console.error("Save error:", error);
      setConnectionStatus("disconnected");
      toast.error(error.message || "Failed to save Shiprocket settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      // Get token (from email/password)
      const response = await fetch("/api/shiprocket/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: config.email,
          password: config.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Authentication failed");
      }

      const { token } = await response.json();

      if (!token) {
        throw new Error("No token received from Shiprocket");
      }

      // Try to fetch pickup locations to verify connection
      await fetchPickupLocations(token);

      toast.success("Connection successful! Shiprocket is properly configured.");

      // Save token
      const configToSave: ShiprocketConfig = {
        ...config,
        token,
        tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };
      const { createClient } = await import("@/src/lib/supabase/client");
      const supabase = createClient();

      await supabase.auth.updateUser({
        data: { shiprocket_config: configToSave }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));

      setConfig(configToSave);
      setConnectionStatus("connected");
    } catch (error: any) {
      console.error("Test connection error:", error);
      setConnectionStatus("disconnected");
      toast.error(error.message || "Connection test failed");
    } finally {
      setTestingConnection(false);
    }
  };

  const handlePickupLocationChange = (value: string) => {
    const selectedLocation = pickupLocations.find(loc => loc.pickup_location === value);
    const updatedConfig = {
      ...config,
      pickupLocation: value,
      pickupLocationId: selectedLocation?.id,
    };
    setConfig(updatedConfig);

    // Save immediately when pickup location changes
    if (config.token) {
      // Save to DB and Local Storage
      import("@/src/lib/supabase/client").then(({ createClient }) => {
         const supabase = createClient();
         supabase.auth.updateUser({
            data: { shiprocket_config: updatedConfig }
         });
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
      toast.success("Pickup location updated!");
    }
  };

  const handleRefreshLocations = async () => {
    if (config.token) {
      await fetchPickupLocations(config.token);
      toast.success("Pickup locations refreshed!");
    } else {
      toast.error("Please authenticate first");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shiprocket Integration</h1>
        <p className="text-muted-foreground">
          Configure your Shiprocket account to enable automated shipping and tracking
        </p>
      </div>

      {/* Connection Status */}
      <div className={`flex items-center gap-2 p-3 rounded-lg ${
        connectionStatus === "connected"
          ? "bg-green-50 border border-green-200"
          : connectionStatus === "disconnected"
          ? "bg-red-50 border border-red-200"
          : "bg-gray-50 border border-gray-200"
      }`}>
        <div className={`w-3 h-3 rounded-full ${
          connectionStatus === "connected"
            ? "bg-green-500"
            : connectionStatus === "disconnected"
            ? "bg-red-500"
            : "bg-gray-400"
        }`} />
        <span className={`text-sm font-medium ${
          connectionStatus === "connected"
            ? "text-green-700"
            : connectionStatus === "disconnected"
            ? "text-red-700"
            : "text-gray-600"
        }`}>
          {connectionStatus === "connected"
            ? "Connected to Shiprocket"
            : connectionStatus === "disconnected"
            ? "Disconnected - Please authenticate"
            : "Connection status unknown"}
        </span>
      </div>

      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          <div>
            <strong>Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Go to Shiprocket Dashboard → Settings → API → Create API User</li>
              <li>Enter your Shiprocket API user email and password below</li>
              <li>Click "Test Connection" to verify your credentials</li>
              <li>Select your default pickup location from the dropdown</li>
              <li>Click "Save Settings" to store your configuration</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shiprocket Credentials
          </CardTitle>
          <CardDescription>
            Enter your Shiprocket account credentials to enable shipping automation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Shiprocket Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Shiprocket Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testingConnection || !config.email || !config.password}
            >
              {testingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !config.email || !config.password}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pickup Location Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pickup Location
          </CardTitle>
          <CardDescription>
            Select your default pickup location for shipments. This MUST match exactly with a location configured in your Shiprocket account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!config.token ? (
            <Alert>
              <AlertDescription>
                Please authenticate with your Shiprocket credentials first to load pickup locations.
              </AlertDescription>
            </Alert>
          ) : loadingLocations ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading pickup locations...
            </div>
          ) : pickupLocations.length === 0 ? (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  No pickup locations found in your Shiprocket account. Please add a pickup location in your Shiprocket dashboard first.
                </AlertDescription>
              </Alert>
              <Button variant="outline" size="sm" onClick={handleRefreshLocations}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Locations
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor="pickupLocation">Default Pickup Location *</Label>
                  <Select
                    value={config.pickupLocation || ""}
                    onValueChange={handlePickupLocationChange}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a pickup location" />
                    </SelectTrigger>
                    <SelectContent>
                      {pickupLocations.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.pickup_location}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{location.pickup_location}</span>
                            <span className="text-xs text-muted-foreground">
                              ({location.city}, {location.pin_code})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefreshLocations}
                  disabled={loadingLocations}
                  className="mt-6"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingLocations ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Selected Location Details */}
              {config.pickupLocation && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Selected Pickup Location
                  </div>
                  {(() => {
                    const selectedLoc = pickupLocations.find(
                      loc => loc.pickup_location === config.pickupLocation
                    );
                    if (selectedLoc) {
                      return (
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p><strong>Name:</strong> {selectedLoc.pickup_location}</p>
                          <p><strong>Address:</strong> {selectedLoc.address}</p>
                          <p><strong>City:</strong> {selectedLoc.city}, {selectedLoc.state} - {selectedLoc.pin_code}</p>
                          <p><strong>Phone:</strong> {selectedLoc.phone}</p>
                          <p><strong>ID:</strong> {selectedLoc.id}</p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn more about Shiprocket API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Shiprocket API Documentation:</strong>{" "}
              <a
                href="https://apidocs.shiprocket.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                https://apidocs.shiprocket.in/
              </a>
            </p>
            <p>
              <strong>Support:</strong> Contact Shiprocket support at{" "}
              <a
                href="mailto:support@shiprocket.in"
                className="text-primary underline"
              >
                support@shiprocket.in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export function to get config (for use in other components)
export function getShiprocketConfig(): ShiprocketConfig | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const config = JSON.parse(saved);
      // Check if token is expired
      if (config.tokenExpiry && Date.now() > config.tokenExpiry) {
        return { ...config, token: undefined, tokenExpiry: undefined };
      }
      return config;
    } catch (e) {
      return null;
    }
  }
  return null;
}
