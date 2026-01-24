"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { getProductPerformanceData } from "@/src/lib/supabase/admin";
import { KPICard } from "@/src/components/admin/kpi-card";
import { AnalyticsBarChart } from "@/src/components/admin/analytics-bar-chart";
import { DataTable } from "@/src/components/admin/data-table";
import { formatCurrency } from "@/src/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function ProductPerformancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getProductPerformanceData();
        setData(res);
      } catch (error) {
        console.error("Failed to load product analytics", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Aggregations
  const totalRevenue = data.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalItemsSold = data.reduce((acc, curr) => acc + curr.totalSold, 0);
  const topProduct = data.length > 0 ? data[0] : null;
  const zeroSalesProducts = data.filter(p => p.totalSold === 0).length;

  // Chart Data (Top 8)
  const chartData = data.slice(0, 8).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    revenue: p.totalRevenue
  }));

  const columns = [
    {
      key: "name",
      header: "Product Name",
      render: (row: any) => (
        <div>
          <div className="font-medium text-sm">{row.name}</div>
        </div>
      )
    },
    {
      key: "totalSold",
      header: "Units Sold",
      render: (row: any) => <div className="font-mono">{row.totalSold}</div>
    },
    {
      key: "currentPrice",
      header: "Price",
      render: (row: any) => formatCurrency(row.currentPrice)
    },
    {
      key: "totalRevenue",
      header: "Revenue",
      render: (row: any) => <div className="font-bold text-green-600 dark:text-green-400">{formatCurrency(row.totalRevenue)}</div>
    }
  ];

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <AdminPageShell
      title="Product Performance"
      description="Detailed performance metrics for your product catalog."
      icon={Package}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Product Revenue"
            value={formatCurrency(totalRevenue)}
            change="Lifetime Sales"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-green-500"
          />
          <KPICard
            title="Total Units Sold"
            value={totalItemsSold}
            change="Volume"
            changeType="neutral"
            icon={Package}
            iconColor="text-blue-500"
          />
          <KPICard
            title="Top Performer"
            value={topProduct ? formatCurrency(topProduct.totalRevenue) : "N/A"}
            change={topProduct ? topProduct.name : "-"}
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-purple-500"
          />
           <KPICard
            title="Zero Sales Items"
            value={zeroSalesProducts}
            change={`${zeroSalesProducts} items unsold`}
            changeType={zeroSalesProducts > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="text-orange-500"
          />
        </div>

        {/* Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 h-[400px]">
                <AnalyticsBarChart
                    title="Top Products by Revenue"
                    description="Highest earning products across your catalog"
                    data={chartData}
                    xKey="name"
                    yKey="revenue"
                    yLabel="currency"
                    color="#009744"
                    height={300}
                />
            </div>
        </div>

        {/* Detailed Table */}
        <Card>
            <CardHeader>
                <CardTitle>Detailed Performance Log</CardTitle>
                <CardDescription>Breakdown of sales per individual product</CardDescription>
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
