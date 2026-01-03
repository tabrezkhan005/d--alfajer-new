"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, DollarSign } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { mockCustomers, mockOrders } from "@/src/lib/mock-data";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { DataTable } from "@/src/components/admin/data-table";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customer = mockCustomers.find((c) => c.id === id);

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

  const customerOrders = mockOrders.filter((o) => o.customerName === customer.name);

  const orderColumns = [
    {
      key: "id",
      header: "Order ID",
    },
    {
      key: "date",
      header: "Date",
      render: (row: typeof mockOrders[0]) => formatDate(row.date),
    },
    {
      key: "total",
      header: "Total",
      render: (row: typeof mockOrders[0]) => formatCurrency(row.total),
    },
    {
      key: "status",
      header: "Status",
      render: (row: typeof mockOrders[0]) => (
        <Badge variant="outline" className="capitalize">
          {row.status}
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
          <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.email}</p>
        </div>
        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
          {customer.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="space-y-4">
              <DataTable data={customerOrders} columns={orderColumns} />
            </TabsContent>
            <TabsContent value="addresses">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      123 Main Street
                      <br />
                      City, State 12345
                      <br />
                      United States
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="notes">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">No notes available.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <span className="font-semibold">{customer.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Spent</span>
                </div>
                <span className="font-semibold">{formatCurrency(customer.totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Member Since</span>
                <span className="font-semibold">{formatDate(customer.joinDate)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
