"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { LucideIcon } from "lucide-react";

interface AdminPageShellProps {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    children?: React.ReactNode;
    icon?: LucideIcon;
}

export function AdminPageShell({ title, description, actionLabel, onAction, children, icon: Icon }: AdminPageShellProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
                    </div>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                {actionLabel && (
                    <Button onClick={onAction} className="w-full sm:w-auto">
                        {actionLabel}
                    </Button>
                )}
            </div>
            <div className="space-y-4">
                {children || (
                    <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon</CardTitle>
                            <CardDescription>This module is currently under development.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50 text-muted-foreground p-8 text-center">
                                <p>The {title} functionality is not yet implemented.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
