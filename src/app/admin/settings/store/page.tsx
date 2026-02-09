"use client";

import { useState, useEffect } from "react";
import { Store, Mail, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { toast } from "sonner";
import { getStoreSetting, updateStoreSetting } from "@/src/lib/supabase/admin";

export default function StoreSettingsPage() {
  const [codEnabled, setCodEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current COD setting on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const value = await getStoreSetting('enable_cod');
        // Default to true if not set
        setCodEnabled(value === true || value === 'true' || value === null);
      } catch (error) {
        console.error('Error fetching COD setting:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleCodToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      const success = await updateStoreSetting('enable_cod', checked, 'Enable Cash on Delivery at checkout');
      if (success) {
        setCodEnabled(checked);
        toast.success(checked ? 'Cash on Delivery enabled' : 'Cash on Delivery disabled');
      } else {
        toast.error('Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating COD setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    toast.success("Store settings saved successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">
          Manage your store information and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Payment Options */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Options
            </CardTitle>
            <CardDescription>Configure available payment methods at checkout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="space-y-0.5">
                <Label htmlFor="cod-toggle" className="text-base font-semibold cursor-pointer">
                  Cash on Delivery (COD)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to pay with cash when the order is delivered
                </p>
              </div>
              <div className="flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Switch
                  id="cod-toggle"
                  checked={codEnabled}
                  onCheckedChange={handleCodToggle}
                  disabled={saving}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {codEnabled
                ? "✅ COD is currently available at checkout"
                : "❌ COD is currently hidden from checkout"}
            </p>
          </CardContent>
        </Card>

        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              General Information
            </CardTitle>
            <CardDescription>Basic store details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name *</Label>
              <Input id="store-name" placeholder="Alfajer" defaultValue="Alfajer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description">Store Description</Label>
              <Textarea
                id="store-description"
                placeholder="Tell customers about your store..."
                rows={4}
                defaultValue="Premium quality products delivered to your doorstep"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Store contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" placeholder="contact@store.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 (555) 123-4567" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Store Address</Label>
              <Textarea
                id="address"
                placeholder="123 Main Street, City, State, ZIP"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Currency & Region */}
        <Card>
          <CardHeader>
            <CardTitle>Currency & Region</CardTitle>
            <CardDescription>Store currency and location settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" value="INR" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" value="Asia/Kolkata" disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
