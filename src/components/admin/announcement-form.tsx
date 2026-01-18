"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  content: z.string().min(3, "Content is required"),
  link_url: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface AnnouncementFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function AnnouncementForm({ initialData, onSubmit, isLoading }: AnnouncementFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    // zodResolver typing can be strict here; cast to any to satisfy resolver type compatibility
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      content: initialData?.content || "",
      link_url: initialData?.link_url || "",
      start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : "",
      end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Announcement Content</Label>
        <Input {...register("content")} placeholder="e.g. Free Shipping on Orders over 200 AED" />
        {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Link URL (Optional)</Label>
        <Input {...register("link_url")} placeholder="/collections/new-arrivals" />
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

      <div className="flex items-center space-x-2 pt-4">
        <Switch
            checked={watch("is_active")}
            onCheckedChange={(c) => setValue("is_active", c)}
        />
        <Label>Active</Label>
      </div>

      <Button type="submit" className="w-full bg-[#009744] hover:bg-[#007A37]" disabled={isLoading}>
        {(isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Update Announcement" : "Create Announcement"}
      </Button>
    </form>
  );
}
