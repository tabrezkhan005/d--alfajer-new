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
import { Textarea } from "@/src/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

// Countries list (can be moved to constants)
const COUNTRIES = [
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "KW", name: "Kuwait" },
  { code: "QA", name: "Qatar" },
  { code: "OM", name: "Oman" },
  { code: "BH", name: "Bahrain" },
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "ALL", name: "All Countries" } // Special case handled by target_audience
];

const formSchema = z.object({
  subject: z.string().min(3, "Subject is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  target_audience: z.enum(["all", "country", "segment"]),
  target_country: z.string().optional(),
  status: z.enum(["draft", "scheduled", "sent"]).default("draft"),
});

interface EmailCampaignFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function EmailCampaignForm({ initialData, onSubmit, isLoading }: EmailCampaignFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    // resolver cast to any to avoid strict generic mismatch between zodResolver and useForm
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      subject: initialData?.subject || "",
      content: initialData?.content || "",
      target_audience: initialData?.target_audience || "all",
      target_country: initialData?.target_country || "",
      status: initialData?.status || "draft",
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const targetAudience = watch("target_audience");

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    // Basic validation logic cleanup
    if (values.target_audience !== "country") {
        values.target_country = "";
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Subject Line</Label>
        <Input {...register("subject")} placeholder="e.g. Big Sale this Weekend!" />
        {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select
                onValueChange={(val: any) => setValue("target_audience", val)}
                defaultValue={initialData?.target_audience || "all"}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="country">Specific Country</SelectItem>
                    <SelectItem value="segment">Segment (VIP, etc.)</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {targetAudience === "country" && (
             <div className="space-y-2">
                <Label>Select Country</Label>
                <Select
                    onValueChange={(val) => setValue("target_country", val)}
                    defaultValue={initialData?.target_country || ""}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                        {COUNTRIES.filter(c => c.code !== "ALL").map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Email Content</Label>
        <Textarea
            {...register("content")}
            className="min-h-[200px]"
            placeholder="Write your email content here..."
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
            type="button"
            variant="outline"
            className="w-1/2"
            onClick={handleSubmit((data) => handleFormSubmit({ ...data, status: "draft" }))}
            disabled={isLoading}
        >
            Save as Draft
        </Button>
        <Button
            type="button"
            className="w-1/2 bg-[#009744] hover:bg-[#007A37]"
            onClick={handleSubmit((data) => handleFormSubmit({ ...data, status: "sent" }))} // Mock send
            disabled={isLoading}
        >
            {(isLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Now
        </Button>
      </div>
    </form>
  );
}
