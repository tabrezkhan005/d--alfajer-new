"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export const KPICard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
}: KPICardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }
  }, []);

  return (
    <Card ref={cardRef} className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0", iconColor)} />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="text-xl sm:text-2xl font-bold truncate">{value}</div>
        {change && (
          <p
            className={cn(
              "text-[10px] sm:text-xs mt-1 line-clamp-2",
              changeType === "positive" && "text-[#009744] dark:text-[#2E763B]",
              changeType === "negative" && "text-[#AB1F23] dark:text-[#AB1F23]",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
