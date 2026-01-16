"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Users } from "lucide-react";

export default function CustomerInsightsPage() {
    return (
        <AdminPageShell
            title="Customer Insights"
            description="Understand customer demographics and buying behavior."
            icon={Users}
        />
    );
}
