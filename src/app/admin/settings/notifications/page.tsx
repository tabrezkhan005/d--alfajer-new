"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    return (
        <AdminPageShell
            title="Notifications"
            description="Configure email and push notification settings."
            icon={Bell}
            actionLabel="Update Settings"
            onAction={() => console.log("Update settings")}
        />
    );
}
