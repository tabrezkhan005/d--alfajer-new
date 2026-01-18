"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { uploadBannerImage } from "@/src/lib/supabase/admin";

const formSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  link_url: z.string().optional(),
  cta_text: z.string().optional(),
  display_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

interface BannerFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function BannerForm({ initialData, onSubmit, isLoading }: BannerFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialData?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    // zodResolver typing strictness varies across schemas; cast to any for compatibility
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      link_url: initialData?.link_url || "",
      cta_text: initialData?.cta_text || "",
      display_order: initialData?.display_order || 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let imageUrl = initialData?.image_url;

      if (file) {
        setIsUploading(true);
        const url = await uploadBannerImage(file);
        if (url) {
          imageUrl = url;
        } else {
            console.error("Failed to upload image");
            // handle error
        }
        setIsUploading(false);
      }

      if (!imageUrl) {
        // We could show error here
        return;
      }

      await onSubmit({ ...values, image_url: imageUrl });
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Banner Image (Required)</Label>
        <div className="flex flex-col gap-2">
            {preview && (
                <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden border">
                    <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
                    <button
                        type="button"
                        onClick={() => { setFile(null); setPreview(""); }}
                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                />
            </div>
            <p className="text-xs text-muted-foreground">Recommended size: 1920x600px</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input {...form.register("title")} placeholder="Hero Title" />
        </div>
        <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input {...form.register("subtitle")} placeholder="Subtitle text" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Link URL</Label>
          <Input {...form.register("link_url")} placeholder="/collections/sale" />
        </div>
        <div className="space-y-2">
            <Label>CTA Text</Label>
            <Input {...form.register("cta_text")} placeholder="Shop Now" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
            <Label>Display Order</Label>
            <Input type="number" {...form.register("display_order")} />
         </div>
          <div className="flex items-center space-x-2 pt-8">
            <Switch
                checked={form.watch("is_active")}
                onCheckedChange={(c) => form.setValue("is_active", c)}
            />
            <Label>Active</Label>
          </div>
      </div>

      <Button type="submit" className="w-full bg-[#009744] hover:bg-[#007A37]" disabled={isLoading || isUploading}>
        {(isLoading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isUploading ? "Uploading..." : initialData ? "Update Banner" : "Create Banner"}
      </Button>
    </form>
  );
}
