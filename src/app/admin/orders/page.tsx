"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Package, Filter } from "lucide-react";
import { DataTable } from "@/src/components/admin/data-table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { mockOrders } from "@/src/lib/mock-data";
import type { Order } from "@/src/lib/mock-data";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

const getStatusBadge = (status: Order["status"]) => {
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

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders =
    statusFilter === "all"
      ? mockOrders
      : mockOrders.filter((order) => order.status === statusFilter);

  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (row: Order) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.id}
        </Link>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      render: (row: Order) => (
        <div>
          <div className="font-medium">{row.customerName}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
    },
    {
      key: "total",
      header: "Total",
      render: (row: Order) => (
        <span className="font-medium">{formatCurrency(row.total)}</span>
      ),
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
    {
      key: "actions",
      header: "Actions",
      render: (row: Order) => (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/orders/${row.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View order</span>
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={filteredOrders}
        columns={columns}
        searchKey="customerName"
        onRowClick={(row) => {
          // Navigate to order detail
          window.location.href = `/admin/orders/${row.id}`;
        }}
      />
    </div>
  );
}
