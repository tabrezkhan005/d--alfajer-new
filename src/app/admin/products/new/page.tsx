 "use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { toast } from "sonner";
import { getCategories } from "@/src/lib/supabase/products";
import { createProduct, uploadProductImage, updateProduct, createVariant } from "@/src/lib/supabase/admin";

export default function NewProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [sku, setSku] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Images
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const cats = await getCategories();
      setCategories(cats as any);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    // generate previews
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    if (!fl) return;
    setFiles(Array.from(fl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // create product (without images first)
      const product = await createProduct({
        name,
        slug: name.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
        description,
        category_id: categoryId,
        base_price: Number(basePrice) || 0,
        original_price: originalPrice ? Number(originalPrice) : undefined,
        is_active: isActive,
      });

      if (!product) {
        throw new Error("Failed to create product");
      }

      // upload images to storage and collect public URLs
      const uploadedUrls: string[] = [];
      for (const f of files) {
        const url = await uploadProductImage(f, product.id);
        if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        await updateProduct(product.id, { images: uploadedUrls } as any);
      }

      // create a default variant if SKU/stock provided
      if (sku || stock) {
        await createVariant({
          product_id: product.id,
          sku: sku || `${product.id}-default`,
          weight: "N/A",
          price: Number(basePrice) || 0,
          stock_quantity: Number(stock) || 0,
        });
      }

      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product for your store
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Basic product details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select required onValueChange={(v) => setCategoryId(v)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Product SKU" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this product visible to customers
                    </p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={(v) => setIsActive(Boolean(v))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set product pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Regular Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale-price">Sale Price</Label>
                    <Input
                      id="sale-price"
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost per item</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Customers won't see this price. Used for profit calculations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Manage stock levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="track-stock" defaultChecked />
                  <Label htmlFor="track-stock">Track inventory for this product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="low-stock" />
                  <Label htmlFor="low-stock">Notify me when stock is low</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Upload product images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop images here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                    className="mx-auto"
                    aria-label="Upload product images"
                  />
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((p, i) => (
                      <div key={i} className="h-24 w-24 rounded overflow-hidden bg-gray-100">
                        <img src={p} alt={`preview-${i}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Recommended: Square images, at least 1000x1000px. Max file size: 5MB.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta-title">Meta Title</Label>
                  <Input id="meta-title" placeholder="Product meta title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-description">Meta Description</Label>
                  <Textarea
                    id="meta-description"
                    placeholder="Product meta description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input id="slug" placeholder="product-url-slug" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Tab */}
          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
                <CardDescription>Shipping information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions (L x W x H in cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Length" type="number" />
                    <Input placeholder="Width" type="number" />
                    <Input placeholder="Height" type="number" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="shipping-required" defaultChecked />
                  <Label htmlFor="shipping-required">This product requires shipping</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
