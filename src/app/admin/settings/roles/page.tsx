"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Shield } from "lucide-react";

export default function RolesPermissionsPage() {
    return (
        <AdminPageShell
            title="Roles & Permissions"
            description="Manage admin users, roles, and access controls."
            icon={Shield}
            actionLabel="Add Role"
            onAction={() => console.log("Add role")}
        />
    );
}
