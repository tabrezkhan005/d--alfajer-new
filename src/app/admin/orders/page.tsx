"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, Loader2, Filter, Download, RefreshCw } from "lucide-react";
import { DataTable } from "@/src/components/admin/data-table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatCurrency } from "@/src/lib/utils";
import { getAllOrders, updateOrderStatus, type OrderWithItems } from "@/src/lib/supabase/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";

// Status badge helper
const getStatusBadge = (status: string | null) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    processing: "default",
    shipped: "secondary",
    delivered: "default",
    cancelled: "destructive",
  };

  return (
    <Badge variant={variants[status || "pending"] || "outline"} className="capitalize">
      {status || "pending"}
    </Badge>
  );
};

// Date formatter helper
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper to escape CSV fields
const escapeCSV = (field: any) => {
  if (field === null || field === undefined) return '';
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders({ status: statusFilter });
      // Orders are already sorted by created_at descending in the database query
      // Additional client-side sort ensures proper ordering even if database sort fails
      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
        const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
        return dateB - dateA; // Newest first
      });
      setOrders(sortedData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Refresh orders when page becomes visible (handles new orders)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    const success = await updateOrderStatus(orderId, newStatus);

    if (success) {
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success("Order status updated");
    } else {
      toast.error("Failed to update status");
    }

    setUpdatingStatus(null);
  };

  const getCustomerName = (order: OrderWithItems) => {
    const address = order.shipping_address as { firstName?: string; lastName?: string; email?: string } | null;
    if (address?.firstName || address?.lastName) {
      return `${address.firstName || ""} ${address.lastName || ""}`.trim();
    }
    return address?.email || "Guest";
  };

  const getCustomerEmail = (order: OrderWithItems) => {
    const address = order.shipping_address as { email?: string } | null;
    return address?.email || "";
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const headers = ["Order ID", "Date", "Customer Name", "Email", "Total", "Status", "Items Count"];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => {
        const name = getCustomerName(order);
        const email = getCustomerEmail(order);
        return [
          escapeCSV(order.id),
          escapeCSV(new Date(order.created_at || '').toLocaleDateString()),
          escapeCSV(name),
          escapeCSV(email),
          escapeCSV(order.total_amount || order.total || 0),
          escapeCSV(order.status),
          escapeCSV(order.items?.length || 0)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (row: OrderWithItems) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.id.slice(0, 8)}...
        </Link>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      render: (row: OrderWithItems) => (
        <div>
          <div className="font-medium">{getCustomerName(row)}</div>
          <div className="text-xs text-muted-foreground">{getCustomerEmail(row)}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (row: OrderWithItems) => row.items?.length || 0,
    },
    {
      key: "total",
      header: "Total",
      render: (row: OrderWithItems) => {
        // Use total_amount from database, fallback to total for backward compatibility
        const total = row.total_amount || row.total || 0;
        return (
          <span className="font-medium">{formatCurrency(total)}</span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: OrderWithItems) => (
        <Select
          value={row.status || "pending"}
          onValueChange={(value) => handleStatusChange(row.id, value)}
          disabled={updatingStatus === row.id}
        >
          <SelectTrigger className="w-32 h-8">
            {updatingStatus === row.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="return_requested">Return Requested</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="return_rejected">Return Rejected</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "payment_status",
      header: "Payment",
      render: (row: OrderWithItems) => {
        const paymentStatus = row.payment_status || "pending";
        const isPaid = paymentStatus === "paid";
        return (
          <Badge 
            variant={isPaid ? "default" : "destructive"} 
            className="capitalize"
          >
            {isPaid ? "Paid" : paymentStatus === "failed" ? "Failed" : "Abandoned"}
          </Badge>
        );
      },
    },
    {
      key: "date",
      header: "Date",
      render: (row: OrderWithItems) => formatDate(row.created_at),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: OrderWithItems) => (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/orders/${row.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View order</span>
          </Link>
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchOrders} 
            disabled={loading}
            className="h-9 sm:h-10"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9 sm:h-10">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9 sm:h-10">
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
              <SelectItem value="return_requested">Return Requested</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="return_rejected">Return Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <DataTable
          data={orders}
          columns={columns}
          searchKey="id"
          onRowClick={(row) => {
            window.location.href = `/admin/orders/${row.id}`;
          }}
        />
      )}
    </div>
  );
}

 export default function OrdersPage() {
   return (
     <Suspense
       fallback={
         <div className="flex items-center justify-center h-96">
           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
       }
     >
       <OrdersContent />
     </Suspense>
   );
 }
