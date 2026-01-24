"use client";

import { useState, useEffect } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { FileText, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DataTable } from "@/src/components/admin/data-table";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "@/src/lib/supabase/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import { toast } from "sonner";
import Link from "next/link";

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentBlog, setCurrentBlog] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Initial Load
    useEffect(() => {
        loadBlogs();
    }, []);

    async function loadBlogs() {
        try {
            const data = await getBlogs();
            setBlogs(data);
        } catch (error) {
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = () => {
        setCurrentBlog({ title: "", excerpt: "", content: "", image_url: "", is_published: false });
        setIsDialogOpen(true);
    };

    const handleEdit = (blog: any) => {
        setCurrentBlog({ ...blog });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return;
        try {
            await deleteBlog(id);
            setBlogs(prev => prev.filter(b => b.id !== id));
            toast.success("Blog post deleted");
        } catch (error) {
            toast.error("Failed to delete blog");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (currentBlog.id) {
                await updateBlog(currentBlog.id, currentBlog);
                toast.success("Blog updated successfully");
            } else {
                await createBlog(currentBlog);
                toast.success("Blog created successfully");
            }
            setIsDialogOpen(false);
            loadBlogs();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save blog");
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            key: "title",
            header: "Title",
            render: (row: any) => (
                <div className="font-medium">{row.title}</div>
            )
        },
        {
            key: "slug",
            header: "Slug",
            render: (row: any) => <span className="text-xs text-muted-foreground">/{row.slug}</span>
        },
        {
            key: "status",
            header: "Status",
            render: (row: any) => (
                <div className={`text-xs px-2 py-1 rounded-full inline-block ${row.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {row.is_published ? 'Published' : 'Draft'}
                </div>
            )
        },
        {
            key: "actions",
            header: "",
            render: (row: any) => (
                <div className="flex justify-end gap-2">
                    <Link href={`/blogs/${row.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(row)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <AdminPageShell
            title="Blogs"
            description="Manage blog posts and news articles."
            icon={FileText}
            actionLabel="Write Post"
            onAction={handleCreate}
        >
            <div className="bg-white dark:bg-card rounded-lg border shadow-sm">
                <DataTable
                    data={blogs}
                    columns={columns}
                    searchKey="title"
                />
            </div>

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentBlog?.id ? "Edit Blog Post" : "New Blog Post"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={currentBlog?.title || ""}
                                    onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image">Featured Image URL</Label>
                                <Input
                                    id="image"
                                    value={currentBlog?.image_url || ""}
                                    onChange={(e) => setCurrentBlog({ ...currentBlog, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="excerpt">Excerpt (Short Summary)</Label>
                                <Textarea
                                    id="excerpt"
                                    value={currentBlog?.excerpt || ""}
                                    onChange={(e) => setCurrentBlog({ ...currentBlog, excerpt: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    value={currentBlog?.content || ""}
                                    onChange={(e) => setCurrentBlog({ ...currentBlog, content: e.target.value })}
                                    rows={12}
                                    className="font-mono text-sm"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Basic text editor. Line breaks are preserved.</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    id="published"
                                    checked={currentBlog?.is_published || false}
                                    onCheckedChange={(checked) => setCurrentBlog({ ...currentBlog, is_published: checked })}
                                />
                                <Label htmlFor="published">Publish immediately</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Post"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminPageShell>
    );
}
