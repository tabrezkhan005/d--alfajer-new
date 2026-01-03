"use client";

import { useState } from "react";
import { Shield, Palette, Type, MousePointerClick } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";

export default function ConsentBannerPage() {
  const [enabled, setEnabled] = useState(true);
  const [bannerText, setBannerText] = useState(
    "We use cookies to enhance your browsing experience and analyze our traffic. By clicking 'Accept All', you consent to our use of cookies."
  );
  const [acceptButton, setAcceptButton] = useState("Accept All");
  const [rejectButton, setRejectButton] = useState("Reject All");
  const [customizeButton, setCustomizeButton] = useState("Customize");
  const [position, setPosition] = useState("bottom");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [buttonColor, setButtonColor] = useState("#000000");

  const handleSave = () => {
    toast.success("Consent banner settings saved");
  };

  const handlePreview = () => {
    toast.info("Preview mode - This is how the banner will appear");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Consent Banner Editor</h1>
        <p className="text-muted-foreground">
          Customize your cookie consent banner appearance and behavior
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Consent Banner</Label>
                  <p className="text-sm text-muted-foreground">
                    Show cookie consent banner to visitors
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Banner Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="banner-text">Banner Text</Label>
                <Textarea
                  id="banner-text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  rows={4}
                  placeholder="Enter banner message..."
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="accept-btn">Accept Button</Label>
                  <Input
                    id="accept-btn"
                    value={acceptButton}
                    onChange={(e) => setAcceptButton(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reject-btn">Reject Button</Label>
                  <Input
                    id="reject-btn"
                    value={rejectButton}
                    onChange={(e) => setRejectButton(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customize-btn">Customize Button</Label>
                  <Input
                    id="customize-btn"
                    value={customizeButton}
                    onChange={(e) => setCustomizeButton(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5" />
                Placement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Banner Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="center">Center (Modal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="button-color">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="button-color"
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>See how your banner will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border p-6 space-y-4"
                style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}
              >
                <p className="text-sm">{bannerText}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: buttonColor,
                      color: "#ffffff",
                    }}
                    className="hover:opacity-90"
                  >
                    {acceptButton}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    style={{
                      borderColor: buttonColor,
                      color: buttonColor,
                    }}
                  >
                    {rejectButton}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ color: buttonColor }}
                  >
                    {customizeButton}
                  </Button>
                </div>
                <div className="text-xs opacity-70">
                  Position: <Badge variant="outline">{position}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={handlePreview}>
          Preview
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
