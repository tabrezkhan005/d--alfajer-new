"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Image } from "lucide-react";

export default function BannersPage() {
    return (
        <AdminPageShell
            title="Banners & Sections"
            description="Manage homepage banners and featured sections."
            icon={Image}
            actionLabel="Add Banner"
            onAction={() => console.log("Add banner")}
        />
    );
}
