 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { DataTable } from "@/src/components/admin/data-table";
import { getProductById } from "@/src/lib/supabase/products";
import { createVariant, updateVariant, deleteVariant, updateStock } from "@/src/lib/supabase/admin";
import { toast } from "sonner";
import { getCategories } from "@/src/lib/supabase/products";
import { updateProduct } from "@/src/lib/supabase/admin";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const productId = params?.id || "";

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [weight, setWeight] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!productId) return;
    fetchProduct();
    fetchCategories();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    const p = await getProductById(productId);
    setProduct(p as any);
    // set form fields
    setName((p as any)?.name || "");
    setDescription((p as any)?.description || "");
    setCategoryId((p as any)?.category?.id || null);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const cats = await getCategories();
    setCategories(cats as any[] || []);
  };

  const openAddVariant = () => {
    setEditingVariant(null);
    setSku("");
    setPrice("");
    setWeight("");
    setStock("");
  };

  const handleSaveVariant = async () => {
    if (!sku || !price) {
      toast.error("SKU and price are required");
      return;
    }
    if (editingVariant) {
      const ok = await updateVariant(editingVariant.id, { sku, price: Number(price), weight });
      if (ok) {
        toast.success("Variant updated");
        fetchProduct();
      } else {
        toast.error("Failed to update variant");
      }
    } else {
      const created = await createVariant({
        product_id: productId,
        sku,
        weight: weight || "N/A",
        price: Number(price),
        stock_quantity: Number(stock) || 0,
      });
      if (created) {
        toast.success("Variant created");
        fetchProduct();
      } else {
        toast.error("Failed to create variant");
      }
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm("Delete variant?")) return;
    const ok = await deleteVariant(id);
    if (ok) {
      toast.success("Variant deleted");
      fetchProduct();
    } else {
      toast.error("Failed to delete variant");
    }
  };

  const handleUpdateStock = async (variantId: string, qty: number) => {
    const ok = await updateStock(variantId, qty);
    if (ok) {
      toast.success("Stock updated");
      fetchProduct();
    } else {
      toast.error("Failed to update stock");
    }
  };

  const columns = [
    { key: "sku", header: "SKU", render: (v: any) => v.sku },
    { key: "weight", header: "Weight", render: (v: any) => v.weight },
    { key: "price", header: "Price", render: (v: any) => `${v.price}` },
    {
      key: "stock",
      header: "Stock",
      render: (v: any) => (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={v.stock_quantity ?? 0}
            onChange={(e) => {
              const newQty = Number(e.target.value || 0);
              // optimistic update locally
              v.stock_quantity = newQty;
            }}
            className="w-20"
            onBlur={(e) => handleUpdateStock(v.id, Number((e.target as HTMLInputElement).value || 0))}
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (v: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => {
            setEditingVariant(v);
            setSku(v.sku || "");
            setPrice(v.price || 0);
            setWeight(v.weight || "");
            setStock(v.stock_quantity || 0);
          }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteVariant(v.id)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>
      </div>

      {/* Product general info */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">Category</Label>
              <select
                value={categoryId || ""}
                onChange={(e) => setCategoryId(e.target.value || null)}
                className="w-full px-2 py-2 border rounded"
              >
                <option value="">Unassigned</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={async () => {
                const ok = await updateProduct(productId, {
                  name,
                  description,
                  category_id: categoryId || null,
                } as any);
                if (ok) {
                  toast.success("Product updated");
                  fetchProduct();
                } else {
                  toast.error("Failed to update product");
                }
              }}
            >
              Save Product
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="flex items-center gap-2">
              <Button onClick={openAddVariant} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Variant
              </Button>
            </div>
          </div>

          <DataTable data={product.variants || []} columns={columns} />

          {/* Variant form */}
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold">Variant Details</h3>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label>SKU</Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div>
                <Label>Price</Label>
                <Input type="number" value={price as any} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div>
                <Label>Weight</Label>
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={stock as any} onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setEditingVariant(null);
                setSku("");
                setPrice("");
                setWeight("");
                setStock("");
              }}>Clear</Button>
              <Button onClick={handleSaveVariant}>Save Variant</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
