"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { FileEdit } from "lucide-react";

export default function ContentPagesPage() {
    return (
        <AdminPageShell
            title="Pages"
            description="Manage static pages (About Us, Contact, etc.)."
            icon={FileEdit}
            actionLabel="Creates Page"
            onAction={() => console.log("Create page")}
        />
    );
}
