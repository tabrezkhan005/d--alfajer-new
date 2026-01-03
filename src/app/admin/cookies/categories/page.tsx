"use client";

import { useState } from "react";
import { Cookie, Lock, BarChart3, Settings, Megaphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
  exampleCookies: string[];
}

const cookieCategories: CookieCategory[] = [
  {
    id: "essential",
    name: "Essential Cookies",
    description: "These cookies are necessary for the website to function and cannot be switched off.",
    required: true,
    enabled: true,
    icon: Lock,
    exampleCookies: ["session_id", "csrf_token", "cart_id"],
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    description: "Help us understand how visitors interact with our website by collecting and reporting information anonymously.",
    required: false,
    enabled: false,
    icon: BarChart3,
    exampleCookies: ["_ga", "_gid", "_gat"],
  },
  {
    id: "functional",
    name: "Functional Cookies",
    description: "Enable enhanced functionality and personalization, such as remembering your preferences.",
    required: false,
    enabled: false,
    icon: Settings,
    exampleCookies: ["user_preferences", "language", "theme"],
  },
  {
    id: "marketing",
    name: "Marketing Cookies",
    description: "Used to track visitors across websites for marketing purposes and to display relevant advertisements.",
    required: false,
    enabled: false,
    icon: Megaphone,
    exampleCookies: ["_fbp", "_fbc", "ads_id"],
  },
];

export default function CookieCategoriesPage() {
  const [categories, setCategories] = useState(cookieCategories);

  const handleToggle = (id: string, enabled: boolean) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, enabled } : cat))
    );
    toast.success(
      enabled ? "Cookie category enabled" : "Cookie category disabled"
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cookie Categories</h1>
        <p className="text-muted-foreground">
          Manage cookie categories and their settings
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{category.name}</CardTitle>
                        {category.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={category.id}
                      checked={category.enabled}
                      onCheckedChange={(checked) =>
                        handleToggle(category.id, checked)
                      }
                      disabled={category.required}
                      aria-label={`Toggle ${category.name}`}
                    />
                    <Label
                      htmlFor={category.id}
                      className={category.required ? "text-muted-foreground" : ""}
                    >
                      {category.enabled ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div>
                  <p className="text-sm font-medium mb-2">Example Cookies:</p>
                  <div className="flex flex-wrap gap-2">
                    {category.exampleCookies.map((cookie) => (
                      <Badge key={cookie} variant="secondary" className="font-mono text-xs">
                        {cookie}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
