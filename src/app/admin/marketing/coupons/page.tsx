"use client";

import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Gift } from "lucide-react";

export default function CouponsPage() {
    return (
        <AdminPageShell
            title="Coupons & Discounts"
            description="Create and manage promotional codes and discounts."
            icon={Gift}
            actionLabel="Create Coupon"
            onAction={() => console.log("Create coupon")}
        />
    );
}
