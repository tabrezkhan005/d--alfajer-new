"use client";

import { useState } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { FileText } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent } from "@/src/components/ui/card";

export default function PrivacyPolicyPage() {
    const [policy, setPolicy] = useState(`Privacy Policy

Last Updated: January 2026

1. Introduction
Welcome to Al Fajer Mart. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.

2. Important Information and Who We Are
Al Fajer Mart is the controller and responsible for your personal data.

3. The Data We Collect About You
We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
- Identity Data includes first name, last name, username or similar identifier.
- Contact Data includes billing address, delivery address, email address and telephone numbers.
- Transaction Data includes details about payments to and from you and other details of products and services you have purchased from us.`);

    const handleSave = () => {
        toast.success("Privacy Policy saved successfully");
    };

    return (
        <AdminPageShell
            title="Privacy Policy"
            description="Manage your store's privacy policy content."
            icon={FileText}
            actionLabel="Save Changes"
            onAction={handleSave}
        >
            <Card>
                <CardContent className="p-6">
                    <Textarea
                        value={policy}
                        onChange={(e) => setPolicy(e.target.value)}
                        className="min-h-[600px] font-sans text-base leading-relaxed p-4"
                        placeholder="Enter your privacy policy text here..."
                    />
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
