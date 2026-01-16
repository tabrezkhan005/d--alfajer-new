"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Search } from "lucide-react";

export default function SeoSettingsPage() {
    return (
        <AdminPageShell
            title="SEO Settings"
            description="Configure global SEO settings and metadata."
            icon={Search}
            actionLabel="Save Changes"
            onAction={() => console.log("Save changes")}
        />
    );
}
