"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface AnalyticsBarChartProps {
  title: string;
  description?: string;
  data: any[];
  xKey: string;
  yKey: string;
  yLabel?: string;
  color?: string;
  height?: number;
}

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
} as const;

export const AnalyticsBarChart = ({
  title,
  description,
  data,
  xKey,
  yKey,
  yLabel,
  color = "hsl(var(--primary))",
  height = 350
}: AnalyticsBarChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current,
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.2
        }
      );
    }
  }, [data]);

  return (
    <Card ref={chartRef} className="w-full h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ height: height }}>
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => yLabel === 'currency' ? `₹${(value / 1000).toFixed(0)}k` : `${value}`}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: 'transparent' }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey={yKey}
                fill={color}
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
