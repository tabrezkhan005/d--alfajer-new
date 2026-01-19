"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";
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
import {
  createProduct,
  createProductVariant,
  uploadProductImage,
  getAdminCategories,
} from "@/src/lib/supabase/admin-products";

// Local origins fallback
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

export default function NewProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [sku, setSku] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">(0);
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getAdminCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      setImageFiles((prev) => [...prev, file]);

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImagePreviews((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

    if (!basePrice || basePrice <= 0) {
      toast.error("Valid price is required");
      return;
    }

    setIsSaving(true);

    try {
      const slug = name.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

      // Create the product first
      const product = await createProduct({
        name,
        slug,
        short_description: description,
        long_description: longDescription,
        category_id: categoryId || undefined,
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
        badge: badge || undefined,
      });

      // Upload images and get URLs
      const uploadedImageUrls: string[] = [];
      for (const file of imageFiles) {
        try {
          const url = await uploadProductImage(product.id, file);
          uploadedImageUrls.push(url);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
        }
      }

      // Update product with image URLs if any were uploaded
      if (uploadedImageUrls.length > 0) {
        const { updateProduct } = await import("@/src/lib/supabase/admin-products");
        await updateProduct(product.id, { images: uploadedImageUrls });
      }

      // Create a default variant
      if (sku || stock) {
        await createProductVariant({
          product_id: product.id,
          sku: sku || `${product.id.slice(0, 8)}-default`,
          weight: packageSize || "N/A",
          price: Number(basePrice),
          compare_at_price: originalPrice ? Number(originalPrice) : undefined,
          stock_quantity: Number(stock) || 0,
        });
      }

      toast.success("Product created successfully!");
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
                    placeholder="Brief product description (shown in cards)"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longDescription">Long Description</Label>
                  <Textarea
                    id="longDescription"
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    placeholder="Detailed product description (shown in product page)"
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    {loadingCategories ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading categories...
                      </div>
                    ) : (
                      <Select onValueChange={(v) => setCategoryId(v)}>
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
                    )}
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
                    <p className="text-xs text-muted-foreground">
                      The price customers will pay
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="original-price">Original Price (Before discount)</Label>
                    <Input
                      id="original-price"
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty if no discount
                    </p>
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
                  <div className="space-y-2">
                    <Label htmlFor="packageSize">Package Size</Label>
                    <Input
                      id="packageSize"
                      value={packageSize}
                      onChange={(e) => setPackageSize(e.target.value)}
                      placeholder="e.g., 250g, 500ml, 1kg"
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
                <CardDescription>Upload product images (stored in Supabase)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Click to upload images or drag and drop
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

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative group">
                        <div className="h-24 w-full rounded overflow-hidden bg-gray-100">
                          <img src={preview} alt={`preview-${i}`} className="h-full w-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
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
                )}

                <p className="text-xs text-muted-foreground">
                  Recommended: Square images, at least 500x500px. Images will be uploaded to cloud storage.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Additional product information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Select onValueChange={(v) => setOrigin(v)}>
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
                Save Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
