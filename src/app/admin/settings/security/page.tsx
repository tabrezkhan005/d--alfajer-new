"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Shield } from "lucide-react";

export default function SecurityPage() {
    return (
        <AdminPageShell
            title="Security Settings"
            description="Configure system security, 2FA, and password policies."
            icon={Shield}
            actionLabel="Update Security"
            onAction={() => console.log("Update security")}
        />
    );
}
