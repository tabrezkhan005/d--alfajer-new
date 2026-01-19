"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { KPICard } from "@/src/components/admin/kpi-card";
import { SalesChart } from "@/src/components/admin/sales-chart";
import { DataTable } from "@/src/components/admin/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { getDashboardStats, getSalesChartData } from "@/src/lib/supabase/admin";
import { formatCurrency } from "@/src/lib/utils";
import { useFadeIn, useStagger } from "@/src/components/admin/animations";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    processing: "default",
    shipped: "secondary",
    delivered: "default",
    cancelled: "destructive",
  };

  return (
    <Badge variant={variants[status] || "outline"} className="capitalize">
      {status}
    </Badge>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const headerRef = useFadeIn(0);
  const kpiCardsRef = useStagger(0.2, 0.1);
  const chartsRef = useFadeIn(0.6);
  const tablesRef = useFadeIn(0.8);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardStats, chartData] = await Promise.all([
          getDashboardStats(),
          getSalesChartData()
        ]);
        setStats(dashboardStats);
        setSalesData(chartData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  const orderColumns = [
    {
      key: "id",
      header: "Order ID",
      render: (row: any) => <span className="font-mono text-xs">{row.id.slice(0, 8)}...</span>
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.customers?.first_name} {row.customers?.last_name}</div>
          <div className="text-xs text-muted-foreground">{row.customers?.email}</div>
        </div>
      )
    },
    {
      key: "total",
      header: "Total",
      render: (row: any) => formatCurrency(row.total),
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => getStatusBadge(row.status),
    },
    {
      key: "created_at",
      header: "Date",
      render: (row: any) => formatDate(row.created_at),
    },
  ];

  const productColumns = [
    {
      key: "name",
      header: "Product",
    },
    {
      key: "stock",
      header: "Stock",
      render: (row: any) => (
        <span className={row.stock < 10 ? "text-[#AB1F23] font-medium" : ""}>
          {row.stock} units
        </span>
      ),
    },
    {
      key: "slug",
      header: "View",
      render: (row: any) => (
        <a href={`/products/${row.slug}`} target="_blank" className="text-blue-600 hover:underline text-sm">
          View
        </a>
      )
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div ref={headerRef} className="w-full">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Overview of your store performance and recent activity
        </p>
      </div>

      {/* KPI Cards */}
      <div ref={kpiCardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue?.value || 0)}
          change="Lifetime"
          changeType="neutral"
          icon={DollarSign}
          iconColor="text-[#009744] dark:text-[#2E763B]"
        />
        <KPICard
          title="Total Orders"
          value={stats?.totalOrders?.value || 0}
          change="Lifetime"
          changeType="neutral"
          icon={ShoppingCart}
        />
        <KPICard
          title="Active Customers"
          value={stats?.activeCustomers?.value || 0}
          change="Registered Users"
          changeType="positive"
          icon={Users}
        />
        <KPICard
          title="Low Stock Items"
          value={stats?.lowStockProducts?.length || 0}
          change={`${stats?.lowStockProducts?.length || 0} products need restocking`}
          changeType={(stats?.lowStockProducts?.length || 0) > 0 ? "negative" : "neutral"}
          icon={AlertTriangle}
          iconColor={(stats?.lowStockProducts?.length || 0) > 0 ? "text-[#AB1F23]" : undefined}
        />
      </div>

      {/* Charts and Tables */}
      <div ref={chartsRef} className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <SalesChart data={salesData} />
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
            <Button className="w-full justify-start text-sm sm:text-base h-10 sm:h-11" variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create New Order
            </Button>
            <Button className="w-full justify-start text-sm sm:text-base h-10 sm:h-11" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            <Button className="w-full justify-start text-sm sm:text-base h-10 sm:h-11" variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card ref={tablesRef}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <DataTable
            data={stats?.recentOrders || []}
            columns={orderColumns}
            searchKey="customer"
          />
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {(stats?.lowStockProducts?.length || 0) > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-[#AB1F23]" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Products that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <DataTable
              data={stats?.lowStockProducts || []}
              columns={productColumns}
              searchKey="name"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
