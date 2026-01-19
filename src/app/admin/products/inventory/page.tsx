"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Box, Search, Save, Loader2, AlertTriangle } from "lucide-react";
import { getAdminProducts, updateVariant } from "@/src/lib/supabase/admin";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

interface InventoryItem {
  id: string; // Variant ID
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  currentStock: number;
  price: number;
  image?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Track local changes before saving
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const products = await getAdminProducts();
      const inventoryItems: InventoryItem[] = [];

      products.forEach(p => {
        if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v: any) => {
                inventoryItems.push({
                    id: v.id,
                    productId: p.id,
                    productName: p.name,
                    variantName: v.weight || "Standard",
                    sku: v.sku,
                    currentStock: v.stock_quantity ?? v.stock ?? 0,
                    price: v.price,
                    image: p.images?.[0]
                });
            });
        }
      });

      setItems(inventoryItems);
      setFilteredItems(inventoryItems);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
        setFilteredItems(items);
        return;
    }
    const lower = searchQuery.toLowerCase();
    setFilteredItems(items.filter(i =>
        i.productName.toLowerCase().includes(lower) ||
        i.sku.toLowerCase().includes(lower)
    ));
  }, [searchQuery, items]);

  const handleStockChange = (id: string, value: string) => {
    const val = parseInt(value);
    if (!isNaN(val) && val >= 0) {
        setStockUpdates(prev => ({ ...prev, [id]: val }));
    }
  };

  const saveStock = async (id: string) => {
    const newStock = stockUpdates[id];
    if (newStock === undefined) return;

    setSavingId(id);
    try {
        const success = await updateVariant(id, { stock_quantity: newStock });
        if (success) {
            toast.success("Stock updated");
            // Update local items state to reflect saved change
            setItems(prev => prev.map(item => item.id === id ? { ...item, currentStock: newStock } : item));
            setStockUpdates(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
        } else {
            toast.error("Failed to update stock");
        }
    } catch (err) {
        toast.error("Error updating stock");
    } finally {
        setSavingId(null);
    }
  };

  return (
    <AdminPageShell
      title="Inventory Management"
      description="Quickly update stock levels for all products."
      icon={Box}
    >
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by product or SKU..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                 </TableRow>
              ) : filteredItems.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No inventory items found.
                    </TableCell>
                 </TableRow>
              ) : (
                filteredItems.map((item) => {
                    const currentVal = stockUpdates[item.id] !== undefined ? stockUpdates[item.id] : item.currentStock;
                    const isLow = currentVal < 10;
                    const isChanged = stockUpdates[item.id] !== undefined && stockUpdates[item.id] !== item.currentStock;

                    return (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.variantName}</TableCell>
                            <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                            <TableCell>
                                {currentVal === 0 ? (
                                    <Badge variant="destructive">Out of Stock</Badge>
                                ) : isLow ? (
                                    <Badge variant="secondary" className="text-orange-600 bg-orange-50 border-orange-200">Low Stock</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">In Stock</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    min="0"
                                    className="w-24"
                                    value={currentVal}
                                    onChange={(e) => handleStockChange(item.id, e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    disabled={!isChanged || savingId === item.id}
                                    onClick={() => saveStock(item.id)}
                                    className={isChanged ? "bg-[#009744] hover:bg-[#007A37]" : ""}
                                >
                                    {savingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminPageShell>
  );
}
