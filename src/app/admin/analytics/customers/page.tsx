"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Users, UserCheck, MapPin, Wallet } from "lucide-react";
import { getCustomerInsightsData } from "@/src/lib/supabase/admin";
import { KPICard } from "@/src/components/admin/kpi-card";
import { AnalyticsBarChart } from "@/src/components/admin/analytics-bar-chart";
import { DataTable } from "@/src/components/admin/data-table";
import { formatCurrency } from "@/src/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function CustomerInsightsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCustomerInsightsData();
        setData(res);
      } catch (error) {
        console.error("Failed to load customer insights", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Aggregations
  const totalCustomers = data.length;
  const activeCustomers = data.filter(c => c.totalOrders > 0).length;
  const totalRevenueAll = data.reduce((acc, curr) => acc + curr.totalSpent, 0);
  const averageLTV = activeCustomers > 0 ? totalRevenueAll / activeCustomers : 0;

  // Chart Data (Top 10 Spenders)
  const chartData = data.slice(0, 10).map(c => ({
    name: c.name.split(' ')[0], // First name for chart brevity
    spent: c.totalSpent
  }));

  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (row: any) => (
        <div>
          <div className="font-medium text-sm">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      )
    },
    {
      key: "location",
      header: "Location",
      render: (row: any) => row.location
    },
    {
      key: "totalOrders",
      header: "Orders",
      render: (row: any) => <div className="font-mono text-center">{row.totalOrders}</div>
    },
    {
      key: "totalSpent",
      header: "Total Spent",
      render: (row: any) => <div className="font-bold text-green-600 dark:text-green-400">{formatCurrency(row.totalSpent)}</div>
    },
    {
       key: "lastOrderDate",
       header: "Last Active",
       render: (row: any) => row.lastOrderDate ? new Date(row.lastOrderDate).toLocaleDateString() : "-"
    }
  ];

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading insights...</div>;
  }

  return (
    <AdminPageShell
      title="Customer Insights"
      description="Deep dive into customer behavior and value."
      icon={Users}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Customers"
            value={totalCustomers}
            change="Registered"
            changeType="neutral"
            icon={Users}
          />
           <KPICard
            title="Active Buyers"
            value={activeCustomers}
            change={`${((activeCustomers/totalCustomers)*100).toFixed(0)}% conversion`}
            changeType="positive"
            icon={UserCheck}
            iconColor="text-green-500"
          />
          <KPICard
            title="Avg. Lifetime Value"
            value={formatCurrency(averageLTV)}
            change="Per Active Customer"
            changeType="positive"
            icon={Wallet}
            iconColor="text-blue-500"
          />
           <KPICard
            title="Top Region"
            value={data.length > 0 ? (data[0].location || 'N/A') : "-"}
            change="Most Top Spenders"
            changeType="neutral"
            icon={MapPin}
            iconColor="text-purple-500"
          />
        </div>

        {/* Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 h-[400px]">
                <AnalyticsBarChart
                    title="Top Customers by Spending"
                    description="Your most valuable customers"
                    data={chartData}
                    xKey="name"
                    yKey="spent"
                    yLabel="currency"
                    color="#D4AF37" // Gold for VIPs
                    height={300}
                />
            </div>
        </div>

        {/* Detailed Table */}
        <Card>
            <CardHeader>
                <CardTitle>Customer Value Ledger</CardTitle>
                <CardDescription>Ranked by total lifetime spending</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable
                    data={data}
                    columns={columns}
                    searchKey="name"
                />
            </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  );
}
