"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { KPICard } from "@/src/components/admin/kpi-card";
import { SalesChart } from "@/src/components/admin/sales-chart";
import { BarChart3, CreditCard, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { getDetailedSalesData } from "@/src/lib/supabase/admin";
import { formatCurrency } from "@/src/lib/utils";

export default function SalesReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getDetailedSalesData();
                setData(res);
            } catch (error) {
                console.error("Failed to load sales data", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading sales reports...</div>;
    }

    const { kpi, chartData } = data || { kpi: {}, chartData: [] };

    return (
        <AdminPageShell
            title="Sales Reports"
            description="Detailed analysis of sales revenue and trends."
            icon={BarChart3}
            actionLabel="Export Report"
            onAction={() => console.log("Export")}
        >
            <div className="space-y-6">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Total Sales"
                        value={formatCurrency(kpi.totalRevenue || 0)}
                        change="Lifetime Revenue"
                        changeType="positive"
                        icon={CreditCard}
                        iconColor="text-blue-500"
                    />
                    <KPICard
                        title="Total Orders"
                        value={kpi.totalOrders || 0}
                        change="Completed Orders"
                        changeType="positive"
                        icon={ShoppingCart}
                        iconColor="text-orange-500"
                    />
                    <KPICard
                        title="Avg. Order Value"
                        value={formatCurrency(kpi.avgOrderValue || 0)}
                        change="Per Transaction"
                        changeType="positive"
                        icon={TrendingUp}
                        iconColor="text-green-500"
                    />
                    <KPICard
                        title="Active Customers"
                        value={kpi.activeCustomers || 0}
                        change="Total Registered"
                        changeType="positive"
                        icon={Users}
                        iconColor="text-purple-500"
                    />
                </div>

                {/* Main Sales Chart */}
                <div className="w-full">
                    {chartData.length > 0 ? (
                        <SalesChart data={chartData} />
                    ) : (
                        <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10 text-muted-foreground">
                            No sales data available yet.
                        </div>
                    )}
                </div>

                {/* Additional Insights Section (Placeholder for future expansion) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* You could add Top Products or Recent Transactions tables here later */}
                </div>
            </div>
        </AdminPageShell>
    );
}
