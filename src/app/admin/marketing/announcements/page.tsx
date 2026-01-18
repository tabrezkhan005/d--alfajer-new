"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Megaphone, Pencil, Trash, ExternalLink } from "lucide-react";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
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
import { AnnouncementForm } from "@/src/components/admin/announcement-form";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Failed to load announcements", error);
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      const success = await deleteAnnouncement(id);
      if (success) {
        toast.success("Announcement deleted");
        loadData();
      } else {
        toast.error("Failed to delete announcement");
      }
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        const success = await updateAnnouncement(editingItem.id, data);
        if (success) {
          toast.success("Announcement updated");
          setIsDialogOpen(false);
          loadData();
        } else {
          toast.error("Failed to update");
        }
      } else {
        const result = await createAnnouncement(data);
        if (result) {
          toast.success("Announcement created");
          setIsDialogOpen(false);
          loadData();
        } else {
          toast.error("Failed to create");
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
      key: "content",
      header: "Content",
      render: (row: any) => (
          <div className="font-medium max-w-[300px] truncate">{row.content}</div>
      ),
    },
    {
      key: "link",
      header: "Link",
      render: (row: any) => (
        row.link_url ? (
            <div className="flex items-center gap-1 text-xs text-blue-600">
                <a href={row.link_url} target="_blank" rel="noreferrer" className="hover:underline max-w-[150px] truncate">
                    {row.link_url}
                </a>
                <ExternalLink className="h-3 w-3" />
            </div>
        ) : <span className="text-xs text-muted-foreground">-</span>
      ),
    },
    {
        key: "dates",
        header: "Schedule",
        render: (row: any) => (
          <div className="text-xs text-muted-foreground">
            <div>{row.start_date ? new Date(row.start_date).toLocaleDateString() : "Immediate"}</div>
            <div>to {row.end_date ? new Date(row.end_date).toLocaleDateString() : "Indefinite"}</div>
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
        title="Announcements"
        description="Manage the top announcement bar messages."
        icon={Megaphone}
        actionLabel="Add Announcement"
        onAction={handleCreate}
      >
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <DataTable
            data={announcements}
            columns={columns}
            searchKey="content"
          />
        </div>
      </AdminPageShell>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Announcement" : "New Announcement"}</DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
