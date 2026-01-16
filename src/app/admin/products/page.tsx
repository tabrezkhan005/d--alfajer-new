"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { DataTable } from "@/src/components/admin/data-table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatCurrency } from "@/src/lib/utils";
import { getAdminProducts, deleteProduct } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/lib/supabase/database.types";
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

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type ProductWithVariants = Product & { variants: ProductVariant[] };

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
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch products from Supabase
  useEffect(() => {
    async function fetchProducts() {
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
    }

    fetchProducts();
  }, []);

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setDeleting(true);
      const success = await deleteProduct(productToDelete);

      if (success) {
        setProducts(products.filter((p) => p.id !== productToDelete));
        toast.success("Product deleted successfully");
      } else {
        toast.error("Failed to delete product");
      }

      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getStock = (product: ProductWithVariants) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
  };

  const getPrice = (product: ProductWithVariants) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0].price;
    }
    return product.base_price || 0;
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (row: ProductWithVariants) => (
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
          {row.images && row.images[0] ? (
            <img src={row.images[0]} alt={row.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">IMG</span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Product Name",
      render: (row: ProductWithVariants) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.variants?.length || 0} variant(s)
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (row: ProductWithVariants) => formatCurrency(getPrice(row)),
    },
    {
      key: "stock",
      header: "Stock",
      render: (row: ProductWithVariants) => {
        const stock = getStock(row);
        return (
          <span className={stock === 0 ? "text-red-600 font-medium" : ""}>
            {stock} units
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: ProductWithVariants) => getStatusBadge(row.is_active ?? false),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ProductWithVariants) => (
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
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">Add Product</span>
          </Link>
        </Button>
      </div>

      <DataTable
        data={products}
        columns={columns}
        searchKey="name"
        selectable
        onSelectionChange={(selected) => {
          console.log("Selected products:", selected);
        }}
      />

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
