"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Box } from "lucide-react";

export default function InventoryPage() {
    return (
        <AdminPageShell
            title="Inventory"
            description="Track stock levels and manage warehouse inventory."
            icon={Box}
            actionLabel="Update Stock"
            onAction={() => console.log("Update stock")}
        />
    );
}
