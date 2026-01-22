"use client";

import { useState, useEffect } from "react";
import { Package, MapPin, Scale, Search, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

const STORAGE_KEY = "shiprocket_config";

export default function ServiceabilityPage() {
  const [config, setConfig] = useState<any>(null);
  const [pickupPincode, setPickupPincode] = useState("");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [weight, setWeight] = useState("0.5");
  const [codAmount, setCodAmount] = useState("");
  const [codType, setCodType] = useState<"COD" | "Prepaid">("Prepaid");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setConfig(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse config:", e);
        }
      }
    }
  }, []);

  const handleCheckServiceability = async () => {
    if (!pickupPincode || !deliveryPincode || !weight) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!config?.token) {
      toast.error("Please configure Shiprocket first");
      return;
    }

    // Check if token is expired and refresh if needed
    let tokenToUse = config.token;
    if (config.tokenExpiry && Date.now() > config.tokenExpiry) {
      toast.info("Token expired, refreshing...");
      try {
        const refreshResponse = await fetch("/api/shiprocket/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: config.email,
            password: config.password,
          }),
        });
        
        if (refreshResponse.ok) {
          const { token } = await refreshResponse.json();
          tokenToUse = token;
          const updatedConfig = {
            ...config,
            token,
            tokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
          setConfig(updatedConfig);
        } else {
          toast.error("Failed to refresh token. Please reconfigure Shiprocket.");
          return;
        }
      } catch (error) {
        toast.error("Failed to refresh token. Please reconfigure Shiprocket.");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/shiprocket/serviceability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenToUse,
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode,
          weight: parseFloat(weight),
          cod: codType === "COD" && codAmount ? parseFloat(codAmount) : 0, // Always include cod (0 for Prepaid)
          cod_type: codType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        if (data.data?.available_courier_companies?.length > 0) {
          toast.success(`Found ${data.data.available_courier_companies.length} available couriers`);
        } else {
          toast.warning("No couriers available for this route");
        }
      } else {
        // Try to parse JSON error, fallback to text
        let errorMessage = `Failed to check serviceability (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.errors || errorMessage;
          
          // If errorData has nested errors, extract them
          if (errorData.errors && typeof errorData.errors === 'object') {
            const errorStrings = Object.entries(errorData.errors).map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            });
            if (errorStrings.length > 0) {
              errorMessage = errorStrings.join('; ') || errorMessage;
            }
          }
          
          console.error("Serviceability API error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
        } catch (parseError) {
          // If JSON parsing fails, try to get text response
          try {
            const textResponse = await response.text();
            if (textResponse) {
              errorMessage = textResponse;
            }
            console.error("Serviceability API error (non-JSON):", {
              status: response.status,
              statusText: response.statusText,
              response: textResponse
            });
          } catch (textError) {
            console.error("Serviceability API error (no response body):", {
              status: response.status,
              statusText: response.statusText
            });
          }
        }
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Serviceability check error:", error);
      const errorMessage = error.message || "Failed to check serviceability. Please check your network connection and try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Test Shiprocket connection
  const testConnection = async () => {
    if (!config?.token) {
      toast.error("Please configure Shiprocket first");
      return;
    }

    setLoading(true);
    try {
      // Check if token is expired and refresh if needed
      let tokenToUse = config.token;
      if (config.tokenExpiry && Date.now() > config.tokenExpiry) {
        if (config.email && config.password) {
          const refreshResponse = await fetch("/api/shiprocket/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: config.email,
              password: config.password,
            }),
          });
          
          if (refreshResponse.ok) {
            const { token } = await refreshResponse.json();
            tokenToUse = token;
            const updatedConfig = {
              ...config,
              token,
              tokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
            setConfig(updatedConfig);
          }
        }
      }

      // Try to get pickup locations as a connection test
      const response = await fetch(`/api/shiprocket/pickup-locations?token=${encodeURIComponent(tokenToUse)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Shiprocket connection is working!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Shiprocket connection failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error("Connection test error:", error);
      toast.error(error.message || "Failed to connect to Shiprocket");
    } finally {
      setLoading(false);
    }
  };

  if (!config?.token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviceability Check</h1>
          <p className="text-muted-foreground">Check if courier can deliver to a location</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Serviceability Check</h1>
        <p className="text-muted-foreground">
          Check if a courier can deliver between two pincodes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check Serviceability</CardTitle>
            <CardDescription>
              Enter pickup and delivery details to check available couriers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-pincode">Pickup Pincode *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pickup-pincode"
                  placeholder="110001"
                  value={pickupPincode}
                  onChange={(e) => setPickupPincode(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-pincode">Delivery Pincode *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="delivery-pincode"
                  placeholder="400001"
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cod-type">Payment Type</Label>
              <select
                id="cod-type"
                value={codType}
                onChange={(e) => setCodType(e.target.value as "COD" | "Prepaid")}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Prepaid">Prepaid</option>
                <option value="COD">COD (Cash on Delivery)</option>
              </select>
            </div>

            {codType === "COD" && (
              <div className="space-y-2">
                <Label htmlFor="cod-amount">COD Amount (₹)</Label>
                <Input
                  id="cod-amount"
                  type="number"
                  placeholder="1000"
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCheckServiceability}
                disabled={loading || !pickupPincode || !deliveryPincode || !weight}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Check Serviceability
                  </>
                )}
              </Button>
              <Button
                onClick={testConnection}
                disabled={loading}
                variant="outline"
                title="Test Shiprocket connection"
                className="shrink-0"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Couriers</CardTitle>
            <CardDescription>
              {results ? "Couriers available for this route" : "Results will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results?.data?.available_courier_companies?.length > 0 ? (
              <div className="space-y-3">
                {results.data.available_courier_companies.map((courier: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{courier.courier_name}</div>
                      <Badge variant="outline">
                        ₹{courier.rate?.toFixed(2) || "N/A"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Estimated Delivery: {courier.estimated_delivery_days || "N/A"} days</div>
                      {courier.cod_charges && (
                        <div>COD Charges: ₹{courier.cod_charges.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : results ? (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  No couriers available for this route. Please try different pincodes or weight.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter details and click "Check Serviceability" to see available couriers</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
