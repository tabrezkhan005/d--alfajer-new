"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Gift, Plus, Pencil, Trash } from "lucide-react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAdminCategories,
  getAdminProducts
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
import { CouponForm } from "@/src/components/admin/coupon-form";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [couponsData, productsData, categoriesData] = await Promise.all([
        getCoupons(),
        getAdminProducts(),
        getAdminCategories()
      ]);
      setCoupons(couponsData || []);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      const success = await deleteCoupon(id);
      if (success) {
        toast.success("Coupon deleted");
        loadData();
      } else {
        toast.error("Failed to delete coupon");
      }
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      if (editingCoupon) {
        const success = await updateCoupon(editingCoupon.id, data);
        if (success) {
          toast.success("Coupon updated successfully");
          setIsDialogOpen(false);
          loadData();
        } else {
          toast.error("Failed to update coupon");
        }
      } else {
        const result = await createCoupon(data);
        if (result) {
          toast.success("Coupon created successfully");
          setIsDialogOpen(false);
          loadData();
        } else {
          toast.error("Failed to create coupon");
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
      key: "code",
      header: "Code",
      render: (row: any) => (
        <span className="font-mono font-bold text-[#009744]">{row.code}</span>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      render: (row: any) => (
        <span>
          {row.discount_value}
          {row.discount_type === "percentage" ? "%" : " AED"}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      render: (row: any) => (
        <span className="text-sm">
          {row.usage_count} / {row.usage_limit || "∞"}
        </span>
      ),
    },
    {
      key: "dates",
      header: "Validity",
      render: (row: any) => (
        <div className="text-xs text-muted-foreground">
          <div>{row.start_date ? new Date(row.start_date).toLocaleDateString() : "Any"}</div>
          <div>to {row.end_date ? new Date(row.end_date).toLocaleDateString() : "Any"}</div>
        </div>
      )
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
        title="Coupons & Discounts"
        description="Create and manage promotional codes and discounts."
        icon={Gift}
        actionLabel="Create Coupon"
        onAction={handleCreate}
      >
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <DataTable
            data={coupons}
            columns={columns}
            searchKey="code"
          />
        </div>
      </AdminPageShell>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
          </DialogHeader>
          <CouponForm
            initialData={editingCoupon}
            products={products}
            categories={categories}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
