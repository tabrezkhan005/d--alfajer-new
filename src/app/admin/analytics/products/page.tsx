"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Package } from "lucide-react";

export default function ProductPerformancePage() {
    return (
        <AdminPageShell
            title="Product Performance"
            description="Analyze best-selling products and inventory turnover."
            icon={Package}
        />
    );
}
