"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Mail } from "lucide-react";

export default function EmailCampaignsPage() {
    return (
        <AdminPageShell
            title="Email Campaigns"
            description="Send newsletters and promotional emails to customers."
            icon={Mail}
            actionLabel="New Campaign"
            onAction={() => console.log("New campaign")}
        />
    );
}
