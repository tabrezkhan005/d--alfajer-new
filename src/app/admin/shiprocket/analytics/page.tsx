"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Calendar, DollarSign, Package, Truck, Clock, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createClient } from "@/src/lib/supabase/client";
import { formatCurrency } from "@/src/lib/utils";

export default function ShippingAnalyticsPage() {
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalShipments: 0,
    totalCost: 0,
    avgCostPerOrder: 0,
    avgDeliveryDays: 0,
    codOrders: 0,
    codAmount: 0,
    rtoCount: 0,
    rtoPercentage: 0
  });
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [courierPerformance, setCourierPerformance] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const { data, error } = await supabase
          .from("shipping_analytics" as any)
          .select("*")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        if (error) throw error;

        const items = data || [];
        setAnalyticsData(items);

        // Calculate aggregated stats
        const totalShipments = items.length;
        const totalCost = items.reduce((sum: number, item: any) => sum + (item.shipping_cost || 0), 0);
        const codItems = items.filter((item: any) => item.cod_charges && item.cod_charges > 0);
        const codOrders = codItems.length;
        const codAmount = codItems.reduce((sum: number, item: any) => sum + (item.cod_charges || 0), 0);
        const deliveredItems = items.filter((item: any) => item.status === "DELIVERED" && item.delivery_days);
        const avgDeliveryDays = deliveredItems.length
          ? deliveredItems.reduce((sum: number, item: any) => sum + item.delivery_days, 0) / deliveredItems.length
          : 0;

        const rtoItems = items.filter((item: any) => item.status && item.status.includes("RTO"));
        const rtoCount = rtoItems.length;
        const rtoPercentage = totalShipments ? (rtoCount / totalShipments) * 100 : 0;

        setStats({
          totalShipments,
          totalCost,
          avgCostPerOrder: totalShipments ? totalCost / totalShipments : 0,
          avgDeliveryDays,
          codOrders,
          codAmount,
          rtoCount,
          rtoPercentage
        });

        // Daily data for charts
        const dailyMap = new Map();
        items.forEach((item: any) => {
          const date = new Date(item.created_at).toLocaleDateString();
          if (!dailyMap.has(date)) {
            dailyMap.set(date, { date, shipments: 0, cost: 0 });
          }
          const entry = dailyMap.get(date);
          entry.shipments += 1;
          entry.cost += (item.shipping_cost || 0);
        });
        setDailyData(Array.from(dailyMap.values()).reverse());

        // Courier Performance
        const courierMap = new Map();
        items.forEach((item: any) => {
          const courier = item.courier_name || "Unknown";
          if (!courierMap.has(courier)) {
            courierMap.set(courier, { name: courier, shipments: 0, cost: 0, delivered: 0, totalDays: 0 });
          }
          const entry = courierMap.get(courier);
          entry.shipments += 1;
          entry.cost += (item.shipping_cost || 0);
          if (item.status === "DELIVERED") {
            entry.delivered += 1;
            if (item.delivery_days) entry.totalDays += item.delivery_days;
          }
        });

        setCourierPerformance(Array.from(courierMap.values()).map((c: any) => ({
          ...c,
          avgDays: c.delivered ? (c.totalDays / c.delivered).toFixed(1) : 0,
          successRate: c.shipments ? ((c.delivered / c.shipments) * 100).toFixed(1) : 0
        })));

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping Analytics</h1>
          <p className="text-muted-foreground">
            Monitor shipping costs, delivery times, and courier performance
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Avg. {formatCurrency(stats.avgCostPerOrder)} / order
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShipments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.rtoPercentage.toFixed(1)}% RTO Rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDeliveryDays.toFixed(1)} Days</div>
            <p className="text-xs text-muted-foreground">
              From pickup to delivery
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COD Orders</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.codOrders}</div>
            <p className="text-xs text-muted-foreground">
              Value: {formatCurrency(stats.codAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Shipment Volume</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="shipments" fill="#009744" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Courier Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courierPerformance.map((courier, index) => (
                <div key={courier.name} className="flex items-center">
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{courier.name}</span>
                      <span className="text-sm text-muted-foreground">{courier.avgDays} days</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-[#009744]"
                        style={{ width: `${courier.successRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{courier.shipments} shipments</span>
                      <span>{courier.successRate}% Success</span>
                    </div>
                  </div>
                </div>
              ))}
              {courierPerformance.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
