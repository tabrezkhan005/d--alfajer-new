"use client";

import { useState, useEffect } from "react";
import { Calculator, MapPin, Scale, DollarSign, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";

const STORAGE_KEY = "shiprocket_config";

export default function RateCalculatorPage() {
  const [config, setConfig] = useState<any>(null);
  const [pickupPincode, setPickupPincode] = useState("");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [weight, setWeight] = useState("0.5");
  const [codAmount, setCodAmount] = useState("");
  const [codType, setCodType] = useState<"COD" | "Prepaid">("Prepaid");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<any[]>([]);

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

  const handleCalculateRates = async () => {
    if (!pickupPincode || !deliveryPincode || !weight) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!config?.token) {
      toast.error("Please configure Shiprocket first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/shiprocket/serviceability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: config.token,
          pickup_pincode: pickupPincode,
          delivery_pincode: deliveryPincode,
          weight: parseFloat(weight),
          ...(codType === "COD" && codAmount && { cod: parseFloat(codAmount) }),
          cod_type: codType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.available_courier_companies) {
          setRates(data.data.available_courier_companies);
          toast.success(`Found ${data.data.available_courier_companies.length} courier options`);
        } else {
          setRates([]);
          toast.warning("No rates available for this route");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to calculate rates");
      }
    } catch (error) {
      console.error("Rate calculation error:", error);
      toast.error("Failed to calculate rates");
    } finally {
      setLoading(false);
    }
  };

  if (!config?.token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Calculator</h1>
          <p className="text-muted-foreground">Calculate shipping rates for any route</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
        <h1 className="text-3xl font-bold tracking-tight">Rate Calculator</h1>
        <p className="text-muted-foreground">
          Calculate shipping rates for any pickup and delivery location
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Shipping Rates</CardTitle>
            <CardDescription>
              Enter shipment details to get accurate shipping rates
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

            <Button
              onClick={handleCalculateRates}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Rates
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Rates</CardTitle>
            <CardDescription>
              {rates.length > 0 ? "Available courier rates" : "Rates will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rates.length > 0 ? (
              <div className="space-y-3">
                {rates
                  .sort((a, b) => (a.rate || 0) - (b.rate || 0))
                  .map((courier: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{courier.courier_name}</div>
                        <Badge variant="default" className="text-lg">
                          ₹{courier.rate?.toFixed(2) || "N/A"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3" />
                          <span>Base Rate: ₹{courier.rate?.toFixed(2) || "N/A"}</span>
                        </div>
                        {courier.cod_charges && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3" />
                            <span>COD Charges: ₹{courier.cod_charges.toFixed(2)}</span>
                          </div>
                        )}
                        <div>Estimated Delivery: {courier.estimated_delivery_days || "N/A"} days</div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter details and click "Calculate Rates" to see shipping costs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
