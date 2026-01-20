"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Eye, Loader2, RefreshCw } from "lucide-react";
import { DataTable } from "@/src/components/admin/data-table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatCurrency } from "@/src/lib/utils";
import {
  getAdminProducts,
  deleteProduct,
  type AdminProductWithVariants,
} from "@/src/lib/supabase/admin-products";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { toast } from "sonner";

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <Badge variant="default" className="capitalize">
      Active
    </Badge>
  ) : (
    <Badge variant="secondary" className="capitalize">
      Inactive
    </Badge>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setDeleting(true);

      try {
        await deleteProduct(productToDelete);
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete));
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete product");
      }

      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (row: AdminProductWithVariants) => {
        const imageUrl = row.images && row.images[0] ? row.images[0] : null;
        return (
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={row.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-muted-foreground">IMG</span>
            )}
          </div>
        );
      },
    },
    {
      key: "name",
      header: "Product Name",
      render: (row: AdminProductWithVariants) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.category?.name || "Uncategorized"}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price & Sizes",
      render: (row: AdminProductWithVariants) => {
        const variantCount = row.variants?.length || 0;
        if (variantCount === 0) {
          return formatCurrency(row.base_price || 0);
        }
        const prices = row.variants?.map((v) => v.price || 0).sort((a, b) => a - b) || [];
        const minPrice = prices[0] || row.base_price || 0;
        const maxPrice = prices[prices.length - 1] || row.base_price || 0;

        return (
          <div>
            <div className="font-medium">
              {minPrice === maxPrice
                ? formatCurrency(minPrice)
                : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
              }
            </div>
            <div className="text-xs text-muted-foreground">
              {variantCount} {variantCount === 1 ? "size" : "sizes"}
            </div>
          </div>
        );
      },
    },
    {
      key: "stock",
      header: "Stock",
      render: (row: AdminProductWithVariants) => {
        const totalStock = row.variants?.reduce(
          (sum, v) => sum + (v.stock_quantity || 0),
          0
        ) || 0;
        return (
          <span className={totalStock === 0 ? "text-red-600 font-medium" : ""}>
            {totalStock} units
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: AdminProductWithVariants) => getStatusBadge(row.is_active ?? false),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: AdminProductWithVariants) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <span>⋯</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/products/${row.slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${row.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Add Product</span>
            </Link>
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first product
          </p>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable
          data={products}
          columns={columns}
          searchKey="name"
          selectable
          onSelectionChange={(selected) => {
            console.log("Selected products:", selected);
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
