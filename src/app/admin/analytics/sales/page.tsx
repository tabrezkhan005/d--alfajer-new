"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { BarChart3 } from "lucide-react";

export default function SalesReportsPage() {
    return (
        <AdminPageShell
            title="Sales Reports"
            description="Detailed analysis of sales revenue and trends."
            icon={BarChart3}
            actionLabel="Export Report"
            onAction={() => console.log("Export")}
        />
    );
}
