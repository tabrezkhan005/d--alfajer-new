"use client";

import { DollarSign, ShoppingCart, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { KPICard } from "@/src/components/admin/kpi-card";
import { SalesChart } from "@/src/components/admin/sales-chart";
import { DataTable } from "@/src/components/admin/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { mockOrders, mockSalesData, mockProducts } from "@/src/lib/mock-data";
import type { Order, Product } from "@/src/lib/mock-data";
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
  const headerRef = useFadeIn(0);
  const kpiCardsRef = useStagger(0.2, 0.1);
  const chartsRef = useFadeIn(0.6);
  const tablesRef = useFadeIn(0.8);

  const recentOrders = mockOrders.slice(0, 5);
  const lowStockProducts = mockProducts.filter((p) => p.stock < 20);

  const orderColumns = [
    {
      key: "id",
      header: "Order ID",
    },
    {
      key: "customerName",
      header: "Customer",
    },
    {
      key: "items",
      header: "Items",
    },
    {
      key: "total",
      header: "Total",
      render: (row: Order) => formatCurrency(row.total),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Order) => getStatusBadge(row.status),
    },
    {
      key: "date",
      header: "Date",
      render: (row: Order) => formatDate(row.date),
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
      render: (row: Product) => (
        <span className={row.stock < 10 ? "text-[#AB1F23] font-medium" : ""}>
          {row.stock} units
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (row: Product) => formatCurrency(row.price),
    },
  ];

  // Calculate KPIs
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const ordersToday = mockOrders.filter((order) => order.date === "2024-01-15").length;
  const activeCustomers = mockOrders.filter(
    (order) => order.status !== "cancelled"
  ).length;
  const lowStockCount = lowStockProducts.length;

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
          value={formatCurrency(totalRevenue)}
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-[#009744] dark:text-[#2E763B]"
        />
        <KPICard
          title="Orders Today"
          value={ordersToday}
          change="+2 from yesterday"
          changeType="positive"
          icon={ShoppingCart}
        />
        <KPICard
          title="Active Customers"
          value={activeCustomers}
          change="+8% from last month"
          changeType="positive"
          icon={Users}
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockCount}
          change={`${lowStockCount} products need restocking`}
          changeType={lowStockCount > 0 ? "negative" : "neutral"}
          icon={AlertTriangle}
          iconColor={lowStockCount > 0 ? "text-[#AB1F23]" : undefined}
        />
      </div>

      {/* Charts and Tables */}
      <div ref={chartsRef} className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <SalesChart data={mockSalesData} />
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
            data={recentOrders}
            columns={orderColumns}
            searchKey="customerName"
            onRowClick={(row) => {
              // Navigate to order detail
              console.log("Navigate to order:", row.id);
            }}
          />
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-[#AB1F23]" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Products that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <DataTable data={lowStockProducts} columns={productColumns} searchKey="name" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
