"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/src/components/admin/data-table";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { getCategories } from "@/src/lib/supabase/products";
import { createCategory, updateCategory, deleteCategory } from "@/src/lib/supabase/admin";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const cats = await getCategories();
    setCategories(cats as any[] || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setOpen(true);
  };

  const handleEdit = (cat: any) => {
    setEditing(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setDescription(cat.description || "");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name) {
      toast.error("Name is required");
      return;
    }
    if (editing) {
      const ok = await updateCategory(editing.id, { name, slug, description });
      if (ok) {
        toast.success("Category updated");
        setOpen(false);
        fetchCategories();
      } else {
        toast.error("Failed to update category");
      }
    } else {
      const created = await createCategory({ name, slug: slug || name.toLowerCase().replace(/\s+/g, "-"), description });
      if (created) {
        toast.success("Category created");
        setOpen(false);
        fetchCategories();
      } else {
        toast.error("Failed to create category");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This will remove the category assignment from products.")) return;
    const ok = await deleteCategory(id);
    if (ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else {
      toast.error("Failed to delete category");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row: any) => <div className="font-medium">{row.name}</div>,
    },
    {
      key: "slug",
      header: "Slug",
      render: (row: any) => <div className="text-sm text-muted-foreground">{row.slug}</div>,
    },
    {
      key: "description",
      header: "Description",
      render: (row: any) => <div className="text-sm text-muted-foreground truncate max-w-[200px]">{row.description || "-"}</div>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)} aria-label="Edit category">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} aria-label="Delete category">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage product categories</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="flex items-center gap-2 bg-[#009744] hover:bg-[#007A37]">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable data={categories} columns={columns} searchKey="name" />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated if blank" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-[#009744] hover:bg-[#007A37]">{editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
