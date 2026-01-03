"use client";

import { Code, FileText, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";

export default function TrackingScriptsPage() {
  const handleSave = () => {
    toast.success("Tracking scripts saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tracking Scripts</h1>
        <p className="text-muted-foreground">
          Configure third-party tracking and analytics scripts
        </p>
      </div>

      <div className="space-y-6">
        {/* Google Analytics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Google Analytics 4
                </CardTitle>
                <CardDescription>
                  Track website traffic and user behavior
                </CardDescription>
              </div>
              <Badge variant="outline">Analytics</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ga4-id">GA4 Measurement ID</Label>
              <Input
                id="ga4-id"
                placeholder="G-XXXXXXXXXX"
                disabled
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter your Google Analytics 4 Measurement ID
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="ga4-script">Custom GA4 Script (Optional)</Label>
              <Textarea
                id="ga4-script"
                placeholder="<!-- Google Analytics 4 script -->"
                rows={4}
                disabled
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Meta Pixel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Meta Pixel (Facebook Pixel)
                </CardTitle>
                <CardDescription>
                  Track conversions and create custom audiences
                </CardDescription>
              </div>
              <Badge variant="outline">Marketing</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pixel-id">Pixel ID</Label>
              <Input
                id="pixel-id"
                placeholder="123456789012345"
                disabled
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter your Meta Pixel ID
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="pixel-script">Custom Pixel Script (Optional)</Label>
              <Textarea
                id="pixel-script"
                placeholder="<!-- Meta Pixel Code -->"
                rows={4}
                disabled
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Google Tag Manager */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Google Tag Manager
                </CardTitle>
                <CardDescription>
                  Manage all your tracking tags in one place
                </CardDescription>
              </div>
              <Badge variant="outline">Analytics</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gtm-id">GTM Container ID</Label>
              <Input
                id="gtm-id"
                placeholder="GTM-XXXXXXX"
                disabled
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter your Google Tag Manager Container ID
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="gtm-script">Custom GTM Script (Optional)</Label>
              <Textarea
                id="gtm-script"
                placeholder="<!-- Google Tag Manager -->"
                rows={4}
                disabled
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Scripts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Custom Tracking Scripts
            </CardTitle>
            <CardDescription>
              Add custom tracking scripts (will be added to head or body)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="head-scripts">Scripts for &lt;head&gt;</Label>
              <Textarea
                id="head-scripts"
                placeholder="<!-- Custom head scripts -->"
                rows={6}
                disabled
                className="font-mono text-xs"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="body-scripts">Scripts for &lt;body&gt;</Label>
              <Textarea
                id="body-scripts"
                placeholder="<!-- Custom body scripts -->"
                rows={6}
                disabled
                className="font-mono text-xs"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Note: These fields are disabled in the UI. Scripts will be managed through the backend API.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
