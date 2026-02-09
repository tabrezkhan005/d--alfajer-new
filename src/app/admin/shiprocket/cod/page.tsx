"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  DollarSign,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { createClient } from "@/src/lib/supabase/client";
import { formatCurrency } from "@/src/lib/utils";
import { DataTable } from "@/src/components/admin/data-table";

export default function CodRemittancePage() {
  const [loading, setLoading] = useState(true);
  const [remittances, setRemittances] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalCod: 0,
    remittedAmount: 0,
    pendingAmount: 0,
    nextRemittance: 0
  });

  useEffect(() => {
    fetchRemittances();
  }, []);

  const fetchRemittances = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch COD orders (delivered)
      // We join with orders table to get details
      const { data: codOrders, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          total_amount,
          payment_method,
          status,
          tracking_number,
          shiprocket_order_id,
          cod_remittance:cod_remittance(*)
        `)
        .eq("payment_method", "cod")
        .in("status", ["delivered", "shipped"]); // Only interested in shipped/delivered for remittance

      if (error) throw error;

      // Process data
      const processed = (codOrders || []).map((order: any) => {
        const remittance = order.cod_remittance?.[0];
        const isRemitted = remittance?.status === "remitted";

        return {
          id: order.id,
          date: new Date(order.created_at).toLocaleDateString(),
          amount: order.total_amount,
          status: isRemitted ? "remitted" : (order.status === "delivered" ? "pending" : "in_transit"),
          utr: remittance?.utr_number || "-",
          remittedDate: remittance?.remitted_date ? new Date(remittance.remitted_date).toLocaleDateString() : "-",
          tracking: order.tracking_number,
          details: remittance
        };
      });

      setRemittances(processed);

      // Calculate stats
      const totalCod = processed.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      const remittedAmount = processed
        .filter((item: any) => item.status === "remitted")
        .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

      const pendingAmount = processed
        .filter((item: any) => item.status === "pending") // Delivered but not paid
        .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

      const inTransitAmount = processed
        .filter((item: any) => item.status === "in_transit")
        .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

      setStats({
        totalCod,
        remittedAmount,
        pendingAmount, // Only delivered ones are "pending remittance"
        nextRemittance: pendingAmount // Assume all pending will be in next remittance
      });

    } catch (error) {
      console.error("Error fetching remittances:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "date",
      header: "Order Date",
    },
    {
      key: "id",
      header: "Order ID",
      render: (row: any) => <span className="font-mono text-xs">{row.id.slice(0, 8)}...</span>
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: any) => <span className="font-medium">{formatCurrency(row.amount)}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => {
        const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
          remitted: "default",
          pending: "destructive", // Pending remittance is urgent/important
          in_transit: "secondary"
        };
        return (
          <Badge variant={variants[row.status] || "outline"} className="capitalize">
            {row.status.replace("_", " ")}
          </Badge>
        );
      }
    },
    {
      key: "utr",
      header: "UTR / Ref",
    },
    {
      key: "remittedDate",
      header: "Remitted Date",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">COD Remittance</h1>
          <p className="text-muted-foreground">
            Track your Cash on Delivery payments and reconciliation
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total COD Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCod)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime COD orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remitted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.remittedAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Settled in bank
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Remittance</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Delivered, waiting for payment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.nextRemittance)}</div>
            <p className="text-xs text-muted-foreground">
              Est. next payout
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">All Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="remitted">Remitted</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DataTable
            data={remittances}
            columns={columns}
            searchKey="id"
          />
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <DataTable
            data={remittances.filter(r => r.status === "pending" || r.status === "in_transit")}
            columns={columns}
            searchKey="id"
          />
        </TabsContent>
         <TabsContent value="remitted" className="space-y-4">
          <DataTable
            data={remittances.filter(r => r.status === "remitted")}
            columns={columns}
            searchKey="id"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
