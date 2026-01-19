"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
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
import { Separator } from "@/src/components/ui/separator";
import { toast } from "sonner";
import {
  getAdminProductById,
  updateProduct,
  updateProductVariant,
  uploadProductImage,
  getAdminCategories,
  type AdminProductWithVariants,
} from "@/src/lib/supabase/admin-products";

// Local origins
const localOrigins = [
  "India",
  "UAE",
  "Kashmir, India",
  "Himalayas",
  "Iran",
  "Afghanistan",
  "Pakistan",
  "Turkey",
];

const availableCertifications = [
  "Organic",
  "Non-GMO",
  "Gluten-Free",
  "Pure",
  "Raw and unprocessed",
  "Premium Grade",
  "Traditional",
  "Authentic",
  "Vegan",
  "Halal",
];

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const productId = params?.id || "";

  const [product, setProduct] = useState<AdminProductWithVariants | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [sku, setSku] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [origin, setOrigin] = useState<string>("");
  const [packageSize, setPackageSize] = useState("");
  const [badge, setBadge] = useState<"SALE" | "HOT" | "NEW" | "">("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState("");
  const [allergenInfo, setAllergenInfo] = useState("");
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fiber, setFiber] = useState("");

  // Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const [productData, categoriesData] = await Promise.all([
          getAdminProductById(productId),
          getAdminCategories(),
        ]);

        setCategories(categoriesData);

        if (productData) {
          setProduct(productData);
          // Populate form
          setName(productData.name || "");
          setDescription((productData as any).short_description || "");
          setLongDescription(productData.long_description || "");
          setCategoryId(productData.category_id || "");
          setBasePrice(productData.base_price || "");
          setOriginalPrice(productData.original_price || "");
          setIsActive(productData.is_active ?? true);
          setOrigin(productData.origin || "");
          setBadge((productData.badge as "SALE" | "HOT" | "NEW" | "") || "");
          setCertifications(productData.certifications || []);
          setIngredients(((productData as any).ingredients || []).join(", "));
          setAllergenInfo(((productData as any).allergen_info || []).join(", "));

          const nf = productData.nutrition_facts as any;
          if (nf) {
            setCalories(nf.calories || "");
            setProtein(nf.protein || "");
            setFat(nf.fat || "");
            setCarbs(nf.carbs || "");
            setFiber(nf.fiber || "");
          }

          setExistingImages(productData.images || []);

          // Get first variant info
          const primaryVariant = productData.variants?.[0];
          if (primaryVariant) {
            setSku(primaryVariant.sku || "");
            setStock(primaryVariant.stock_quantity || "");
            setPackageSize(primaryVariant.weight || "");
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [productId]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      setNewImageFiles((prev) => [...prev, file]);

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setNewImagePreviews((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCertification = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!basePrice || Number(basePrice) <= 0) {
      toast.error("Valid price is required");
      return;
    }

    setIsSaving(true);

    try {
      // Upload new images
      const uploadedImageUrls: string[] = [];
      for (const file of newImageFiles) {
        try {
          const url = await uploadProductImage(productId, file);
          uploadedImageUrls.push(url);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls];

      await updateProduct(productId, {
        name,
        short_description: description,
        long_description: longDescription,
        category_id: categoryId || null,
        base_price: Number(basePrice),
        original_price: originalPrice ? Number(originalPrice) : Number(basePrice),
        origin: origin || undefined,
        certifications,
        ingredients: ingredients.split(',').map(s => s.trim()).filter(Boolean),
        allergen_info: allergenInfo.split(',').map(s => s.trim()).filter(Boolean),
        nutrition_facts: {
          calories: Number(calories) || 0,
          protein,
          fat,
          carbs,
          fiber
        },
        is_active: isActive,
        is_on_sale: badge === "SALE" || badge === "HOT",
        badge: badge || null,
        images: allImages,
      } as any);

      // Update the primary variant stock if it exists
      const primaryVariant = product?.variants?.[0];
      if (primaryVariant && stock !== "") {
        await updateProductVariant(primaryVariant.id, {
          stock_quantity: Number(stock),
          sku: sku || primaryVariant.sku,
          weight: packageSize || primaryVariant.weight,
          price: Number(basePrice),
        });
      }

      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
        <p className="text-muted-foreground mt-2">
          This product doesn't exist or has been deleted.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Update product: {product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
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
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief product description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longDescription">Long Description</Label>
                  <Textarea
                    id="longDescription"
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    placeholder="Detailed product description"
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
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
                    <Input
                      id="sku"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Product SKU"
                    />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Sale Price (Current) *</Label>
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
                    <Label htmlFor="original-price">Original Price</Label>
                    <Input
                      id="original-price"
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
                  <Label htmlFor="badge">Product Badge</Label>
                  <Select value={badge || "none"} onValueChange={(v) => setBadge(v === "none" ? "" : v as "SALE" | "HOT" | "NEW" | "")}>
                    <SelectTrigger id="badge">
                      <SelectValue placeholder="Select badge (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Badge</SelectItem>
                      <SelectItem value="SALE">SALE</SelectItem>
                      <SelectItem value="HOT">HOT</SelectItem>
                      <SelectItem value="NEW">NEW</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packageSize">Package Size</Label>
                    <Input
                      id="packageSize"
                      value={packageSize}
                      onChange={(e) => setPackageSize(e.target.value)}
                      placeholder="e.g., 250g, 500ml"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Manage product images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Current Images</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {existingImages.map((url, i) => (
                        <div key={url} className="relative group">
                          <div className="h-24 w-full rounded overflow-hidden bg-gray-100">
                            <img src={url} alt={`product-${i}`} className="h-full w-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Click to add more images
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                    className="mx-auto"
                  />
                </div>

                {/* New Image Previews */}
                {newImagePreviews.length > 0 && (
                  <div>
                    <Label className="mb-2 block">New Images (to be uploaded)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {newImagePreviews.map((preview, i) => (
                        <div key={i} className="relative group">
                          <div className="h-24 w-full rounded overflow-hidden bg-gray-100">
                            <img src={preview} alt={`preview-${i}`} className="h-full w-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Additional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Select value={origin} onValueChange={(v) => setOrigin(v)}>
                    <SelectTrigger id="origin">
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {localOrigins.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableCertifications.map((cert) => (
                      <label
                        key={cert}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                          certifications.includes(cert)
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={certifications.includes(cert)}
                          onChange={() => toggleCertification(cert)}
                          className="sr-only"
                        />
                        <span className="text-sm">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />
                <div className="space-y-4">
                  <Label className="text-base">Nutritional Information</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                       <Label>Calories</Label>
                       <Input type="number" value={calories} onChange={e => setCalories(Number(e.target.value))} placeholder="kcal" />
                    </div>
                    <div className="space-y-2">
                       <Label>Protein</Label>
                       <Input value={protein} onChange={e => setProtein(e.target.value)} placeholder="e.g. 10g" />
                    </div>
                    <div className="space-y-2">
                       <Label>Fat</Label>
                       <Input value={fat} onChange={e => setFat(e.target.value)} placeholder="e.g. 5g" />
                    </div>
                    <div className="space-y-2">
                       <Label>Carbs</Label>
                       <Input value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="e.g. 20g" />
                    </div>
                    <div className="space-y-2">
                       <Label>Fiber</Label>
                       <Input value={fiber} onChange={e => setFiber(e.target.value)} placeholder="e.g. 2g" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <Label>Ingredients</Label>
                   <Textarea
                     value={ingredients}
                     onChange={e => setIngredients(e.target.value)}
                     placeholder="Enter ingredients separated by commas (e.g. Saffron, Honey, Water)"
                   />
                </div>

                <div className="space-y-2">
                    <Label>Allergens</Label>
                    <Textarea
                      value={allergenInfo}
                      onChange={e => setAllergenInfo(e.target.value)}
                      placeholder="Enter allergens separated by commas (e.g. Nuts, Dairy)"
                    />
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
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
