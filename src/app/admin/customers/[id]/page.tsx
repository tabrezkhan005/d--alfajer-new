"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, Globe, Calendar, Loader2, User } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { formatCurrency } from "@/src/lib/utils";
import { DataTable } from "@/src/components/admin/data-table";
import { createClient } from "@/src/lib/supabase/client";
import { toast } from "sonner";

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

interface CustomerOrder {
  id: string;
  created_at: string;
  total: number;
  status: string | null;
  items_count: number;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch customer
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", id)
          .single();

        if (customerError) {
          console.error("Error fetching customer:", customerError);
          toast.error("Failed to load customer");
          return;
        }

        if (customerData) {
          const rawData = customerData as any;
          setCustomer({
            ...rawData,
            full_name: `${rawData.first_name || ''} ${rawData.last_name || ''}`.trim(),
            country: rawData.country || null,
            role: "customer",
          } as Customer);
        }

        // Fetch customer orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            id,
            created_at,
            total,
            status,
            order_items(id)
          `)
          .eq("customer_id", id)
          .order("created_at", { ascending: false });

        if (!ordersError && ordersData) {
          setOrders(ordersData.map((order: any) => ({
            id: order.id,
            created_at: order.created_at,
            total: order.total,
            status: order.status,
            items_count: order.order_items?.length || 0,
          })));
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Not Found</h1>
          <p className="text-muted-foreground">The customer you're looking for doesn't exist.</p>
        </div>
        <Button asChild>
          <Link href="/admin/customers">Back to Customers</Link>
        </Button>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

  const orderColumns = [
    {
      key: "id",
      header: "Order ID",
      render: (row: CustomerOrder) => (
        <Link href={`/admin/orders/${row.id}`} className="font-mono text-sm text-primary hover:underline">
          {row.id.slice(0, 8)}...
        </Link>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row: CustomerOrder) => formatDate(row.created_at),
    },
    {
      key: "items",
      header: "Items",
      render: (row: CustomerOrder) => row.items_count,
    },
    {
      key: "total",
      header: "Total",
      render: (row: CustomerOrder) => formatCurrency(row.total),
    },
    {
      key: "status",
      header: "Status",
      render: (row: CustomerOrder) => (
        <Badge variant={row.status === "delivered" ? "default" : "outline"} className="capitalize">
          {row.status || "pending"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#009744] to-[#2E763B] flex items-center justify-center text-white font-bold text-xl">
              {(customer.full_name || customer.email || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {customer.full_name || "Unnamed Customer"}
              </h1>
              <p className="text-muted-foreground">{customer.email}</p>
            </div>
          </div>
        </div>
        <Badge variant={customer.role === "admin" ? "default" : "secondary"} className="capitalize">
          {customer.role || "customer"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <Tabs defaultValue="orders">
            <CardHeader>
              <TabsList>
                <TabsTrigger value="orders">Orders ({totalOrders})</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="orders" className="mt-0">
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <DataTable data={orders} columns={orderColumns} />
                )}
              </TabsContent>
              <TabsContent value="activity" className="mt-0">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Activity log coming soon</p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          {/* Customer Stats */}
          <Card className="bg-gradient-to-br from-white to-green-50 border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#009744]" />
                Customer Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Orders</span>
                <span className="text-2xl font-bold text-[#009744]">{totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="text-2xl font-bold text-[#009744]">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                <span className="font-semibold">
                  {totalOrders > 0 ? formatCurrency(totalSpent / totalOrders) : formatCurrency(0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              {customer.country && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.country}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Member since {formatDate(customer.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:${customer.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
