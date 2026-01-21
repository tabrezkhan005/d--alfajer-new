"use client";

import { useState, useEffect } from "react";
import { Package, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

const STORAGE_KEY = "shiprocket_config";

interface ShiprocketConfig {
  email: string;
  password: string;
  token?: string;
  tokenExpiry?: number;
  pickupLocation?: string;
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

  // Load saved configuration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
        } catch (e) {
          console.error("Failed to parse saved config:", e);
        }
      }
    }
  }, []);

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

      // Save config with token
      const configToSave: ShiprocketConfig = {
        ...config,
        token,
        tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
      setConfig(configToSave);
      toast.success("Shiprocket credentials saved and authenticated successfully!");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save Shiprocket settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
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

      // Try to fetch pickup locations to verify connection
      const locationsResponse = await fetch(
        `/api/shiprocket/pickup-locations?token=${token}`
      );

      if (locationsResponse.ok) {
        toast.success("Connection successful! Shiprocket is properly configured.");
      } else {
        throw new Error("Failed to fetch pickup locations");
      }
    } catch (error: any) {
      console.error("Test connection error:", error);
      toast.error(error.message || "Connection test failed");
    } finally {
      setTestingConnection(false);
    }
  };

  const getShiprocketConfig = (): ShiprocketConfig | null => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shiprocket Integration</h1>
        <p className="text-muted-foreground">
          Configure your Shiprocket account to enable automated shipping and tracking
        </p>
      </div>

      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          <strong>Setup Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Log in to your Shiprocket account at{" "}
              <a
                href="https://app.shiprocket.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                app.shiprocket.in
              </a>
            </li>
            <li>Go to Settings → API Settings to verify your API access</li>
            <li>Enter your Shiprocket email and password below</li>
            <li>Click "Test Connection" to verify your credentials</li>
            <li>Click "Save Settings" to store your configuration</li>
          </ol>
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

          <div className="space-y-2">
            <Label htmlFor="pickupLocation">Default Pickup Location</Label>
            <Input
              id="pickupLocation"
              placeholder="Enter pickup location name (optional)"
              value={config.pickupLocation || ""}
              onChange={(e) => setConfig({ ...config, pickupLocation: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use your default pickup location from Shiprocket
            </p>
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
