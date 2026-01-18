"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.coerce.number().min(0, "Value must be positive"),
  min_cart_value: z.coerce.number().min(0).optional(),
  usage_limit: z.coerce.number().min(0).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().default(true),
  applicable_products: z.array(z.string()).default([]),
  applicable_categories: z.array(z.string()).default([]),
});

interface CouponFormProps {
  initialData?: any;
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function CouponForm({
  initialData,
  products = [],
  categories = [],
  onSubmit,
  isLoading,
}: CouponFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    // Cast resolver to any to align types between zod and react-hook-form resolver signature
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      code: initialData?.code || "",
      discount_type: initialData?.discount_type || "percentage",
      discount_value: initialData?.discount_value || 0,
      min_cart_value: initialData?.min_cart_value || 0,
      usage_limit: initialData?.usage_limit || 0,
      start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : "",
      end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : "",
      is_active: initialData?.is_active ?? true,
      applicable_products: initialData?.applicable_products || [],
      applicable_categories: initialData?.applicable_categories || [],
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const applicableProducts = watch("applicable_products");
  const applicableCategories = watch("applicable_categories");

  const toggleProduct = (id: string, checked: boolean) => {
    if (checked) {
      setValue("applicable_products", [...applicableProducts, id]);
    } else {
      setValue("applicable_products", applicableProducts.filter(p => p !== id));
    }
  };

  const toggleCategory = (id: string, checked: boolean) => {
    if (checked) {
      setValue("applicable_categories", [...applicableCategories, id]);
    } else {
      setValue("applicable_categories", applicableCategories.filter(c => c !== id));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Coupon Code</Label>
          <Input {...register("code")} placeholder="e.g. SUMMER25" />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>
        <div className="space-y-2">
            <Label>Discount Type</Label>
            <Select
                onValueChange={(val: any) => setValue("discount_type", val)}
                defaultValue={initialData?.discount_type || "percentage"}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Value</Label>
          <Input type="number" step="0.01" {...register("discount_value")} />
          {errors.discount_value && <p className="text-sm text-red-500">{errors.discount_value.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Min Cart Value</Label>
          <Input type="number" step="0.01" {...register("min_cart_value")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" {...register("start_date")} />
        </div>
         <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" {...register("end_date")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Usage Limit (0 for unlimited)</Label>
        <Input type="number" {...register("usage_limit")} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
            checked={watch("is_active")}
            onCheckedChange={(checked) => setValue("is_active", checked)}
        />
        <Label>Active</Label>
      </div>

      <div className="space-y-2">
        <Label>Applicable Categories (Optional)</Label>
        <ScrollArea className="h-32 border rounded-md p-2">
            {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                        checked={applicableCategories.includes(cat.id)}
                        onCheckedChange={(checked) => toggleCategory(cat.id, checked as boolean)}
                    />
                    <span className="text-sm">{cat.name}</span>
                </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-muted-foreground p-2">No categories found.</p>}
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <Label>Applicable Products (Optional)</Label>
        <ScrollArea className="h-32 border rounded-md p-2">
            {products.map((prod) => (
                <div key={prod.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                        checked={applicableProducts.includes(prod.id)}
                        onCheckedChange={(checked) => toggleProduct(prod.id, checked as boolean)}
                    />
                    <span className="text-sm">{prod.name}</span>
                </div>
            ))}
             {products.length === 0 && <p className="text-sm text-muted-foreground p-2">No products found.</p>}
        </ScrollArea>
      </div>

      <Button type="submit" className="w-full bg-[#009744] hover:bg-[#007A37]" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Update Coupon" : "Create Coupon"}
      </Button>
    </form>
  );
}
