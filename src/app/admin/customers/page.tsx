"use client";

import Link from "next/link";
import { Eye, Mail, ShoppingBag, DollarSign } from "lucide-react";
import { DataTable } from "@/src/components/admin/data-table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { mockCustomers } from "@/src/lib/mock-data";
import type { Customer } from "@/src/lib/mock-data";
import { formatCurrency } from "@/src/lib/utils";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function CustomersPage() {
  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (row: Customer) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      key: "totalOrders",
      header: "Orders",
      render: (row: Customer) => (
        <div className="flex items-center gap-1">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          <span>{row.totalOrders}</span>
        </div>
      ),
    },
    {
      key: "totalSpent",
      header: "Total Spent",
      render: (row: Customer) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatCurrency(row.totalSpent)}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Customer) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "joinDate",
      header: "Member Since",
      render: (row: Customer) => formatDate(row.joinDate),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Customer) => (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/customers/${row.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View customer</span>
          </Link>
        </Button>
      ),
    },
  ];

  const totalCustomers = mockCustomers.length;
  const activeCustomers = mockCustomers.filter((c) => c.status === "active").length;
  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage and view customer information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">Active Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={mockCustomers}
        columns={columns}
        searchKey="name"
        onRowClick={(row) => {
          window.location.href = `/admin/customers/${row.id}`;
        }}
      />
    </div>
  );
}
