"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/src/components/admin/admin-page-shell";
import { Mail, Plus, Pencil, Trash, Send, FileText } from "lucide-react";
import {
  getEmailCampaigns,
  createEmailCampaign,
  updateEmailCampaign,
  deleteEmailCampaign
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
import { EmailCampaignForm } from "@/src/components/admin/email-campaign-form";

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getEmailCampaigns();
      setCampaigns(data || []);
    } catch (error) {
      console.error("Failed to load campaigns", error);
      toast.error("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingCampaign(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (campaign: any) => {
    if (campaign.status === 'sent') {
        toast.info("Cannot edit sent campaigns");
        return;
    }
    setEditingCampaign(campaign);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      const success = await deleteEmailCampaign(id);
      if (success) {
        toast.success("Campaign deleted");
        loadData();
      } else {
        toast.error("Failed to delete campaign");
      }
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      if (editingCampaign) {
        const success = await updateEmailCampaign(editingCampaign.id, data);
        if (success) {
          toast.success(data.status === 'sent' ? "Campaign sent!" : "Campaign updated");
          setIsDialogOpen(false);
          loadData();
        } else {
          toast.error("Failed to update campaign");
        }
      } else {
        const result = await createEmailCampaign(data);
        if (result) {
          toast.success(data.status === 'sent' ? "Campaign sent!" : "Campaign created");
          setIsDialogOpen(false);
          loadData();
        } else {
          toast.error("Failed to create campaign");
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
      key: "subject",
      header: "Subject",
      render: (row: any) => (
          <div className="font-medium">{row.subject}</div>
      ),
    },
    {
      key: "target",
      header: "Target",
      render: (row: any) => (
        <span className="text-sm capitalize">
            {row.target_audience === 'country' ? `Country: ${row.target_country}` : row.target_audience}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => {
          const variants: Record<string, "default" | "secondary" | "outline"> = {
              sent: "default",
              draft: "secondary",
              scheduled: "outline"
          };
          return (
            <Badge variant={variants[row.status] || "outline"} className="capitalize">
              {row.status}
            </Badge>
          );
      },
    },
    {
        key: "date",
        header: "Date",
        render: (row: any) => (
            <span className="text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleDateString()}
            </span>
        )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
            {row.status !== 'sent' && (
                <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
                    <Pencil className="h-4 w-4" />
                </Button>
            )}
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
        title="Email Campaigns"
        description="Create and send newsletters to your customers."
        icon={Mail}
        actionLabel="New Campaign"
        onAction={handleCreate}
      >
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <DataTable
            data={campaigns}
            columns={columns}
            searchKey="subject"
          />
        </div>
      </AdminPageShell>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "Edit Campaign" : "New Email Campaign"}</DialogTitle>
          </DialogHeader>
          <EmailCampaignForm
            initialData={editingCampaign}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
