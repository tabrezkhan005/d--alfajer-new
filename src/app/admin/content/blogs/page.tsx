"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { FileText } from "lucide-react";

export default function BlogsPage() {
    return (
        <AdminPageShell
            title="Blogs"
            description="Manage blog posts and news articles."
            icon={FileText}
            actionLabel="Write Post"
            onAction={() => console.log("Write post")}
        />
    );
}
