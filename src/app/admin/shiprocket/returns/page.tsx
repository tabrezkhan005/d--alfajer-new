"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Package, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

const STORAGE_KEY = "shiprocket_config";

export default function ReturnsPage() {
  const [config, setConfig] = useState<any>(null);

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

  if (!config?.token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Return Orders</h1>
          <p className="text-muted-foreground">Manage return shipments</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
        <h1 className="text-3xl font-bold tracking-tight">Return Orders</h1>
        <p className="text-muted-foreground">
          Create and manage return shipments through Shiprocket
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return Order Management</CardTitle>
          <CardDescription>
            Create return orders for customer returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Return order creation can be done from individual order pages.
              Navigate to an order and use the return order feature.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/admin/orders">View Orders</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
