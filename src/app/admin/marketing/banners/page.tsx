"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Image as ImageIcon, Plus, Pencil, Trash, ExternalLink } from "lucide-react";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from "@/src/lib/supabase/admin";
import { DataTable } from "@/src/components/admin/data-table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { BannerForm } from "@/src/components/admin/banner-form";
import Image from "next/image";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getBanners();
      setBanners(data || []);
    } catch (error) {
      console.error("Failed to load banners", error);
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingBanner(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      const success = await deleteBanner(id);
      if (success) {
        toast.success("Banner deleted");
        loadData();
      } else {
        toast.error("Failed to delete banner");
      }
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      if (editingBanner) {
        const success = await updateBanner(editingBanner.id, data);
        if (success) {
          toast.success("Banner updated");
          setIsDialogOpen(false);
          loadData();
        } else {
          toast.error("Failed to update banner");
        }
      } else {
        const result = await createBanner(data);
        if (result) {
          toast.success("Banner created");
          setIsDialogOpen(false);
          loadData();
        } else {
          toast.error("Failed to create banner");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
        key: "image",
        header: "Image",
        render: (row: any) => (
            <div className="relative w-24 h-12 rounded overflow-hidden bg-gray-100 border">
                {row.image_url && <Image src={row.image_url} alt="Banner" fill className="object-cover" unoptimized />}
            </div>
        )
    },
    {
      key: "title",
      header: "Title",
      render: (row: any) => (
          <div>
            <div className="font-medium">{row.title || "No Title"}</div>
            <div className="text-xs text-muted-foreground">{row.subtitle}</div>
          </div>
      ),
    },
    {
      key: "link",
      header: "Link",
      render: (row: any) => (
        row.link_url ? (
            <div className="flex items-center gap-1 text-xs text-blue-600">
                <a href={row.link_url} target="_blank" rel="noreferrer" className="hover:underline max-w-[150px] truncate">
                    {row.link_url}
                </a>
                <ExternalLink className="h-3 w-3" />
            </div>
        ) : <span className="text-xs text-muted-foreground">-</span>
      ),
    },
    {
      key: "order",
      header: "Order",
      render: (row: any) => row.display_order
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: any) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(row.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageShell
        title="Hero Banners"
        description="Manage the main sliders on the home page."
        icon={ImageIcon}
        actionLabel="Add Banner"
        onAction={handleCreate}
      >
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <DataTable
            data={banners}
            columns={columns}
            searchKey="title"
          />
        </div>
      </AdminPageShell>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
          </DialogHeader>
          <BannerForm
            initialData={editingBanner}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
