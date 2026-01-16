"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Tag } from "lucide-react";

export default function CategoriesPage() {
    return (
        <AdminPageShell
            title="Categories"
            description="Manage product categories and subcategories."
            icon={Tag}
            actionLabel="Add Category"
            onAction={() => console.log("Add category")}
        />
    );
}
