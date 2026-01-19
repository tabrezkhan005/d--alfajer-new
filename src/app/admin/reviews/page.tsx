"use client";

import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, MessageSquare, Loader2, RefreshCw, Eye } from "lucide-react";
import { DataTable } from "@/src/components/admin/data-table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  getAdminReviews,
  updateReviewApproval,
  updateReviewFeatured,
  deleteReview,
  type ProductReview,
} from "@/src/lib/supabase/reviews";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAdminReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApproval = async (reviewId: string, approve: boolean) => {
    try {
      await updateReviewApproval(reviewId, approve);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, is_approved: approve } : r
        )
      );
      toast.success(approve ? "Review approved" : "Review rejected");
    } catch (error) {
      console.error("Error updating approval:", error);
      toast.error("Failed to update review");
    }
  };

  const handleFeatured = async (reviewId: string, featured: boolean) => {
    try {
      await updateReviewFeatured(reviewId, featured);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, is_featured: featured } : r
        )
      );
      toast.success(featured ? "Review featured" : "Review unfeatured");
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast.error("Failed to update review");
    }
  };

  const handleDelete = (id: string) => {
    setReviewToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (reviewToDelete) {
      setDeleting(true);
      try {
        await deleteReview(reviewToDelete);
        setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete));
        toast.success("Review deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete review");
      }
      setDeleting(false);
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const viewReview = (review: ProductReview) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const columns = [
    {
      key: "rating",
      header: "Rating",
      render: (row: ProductReview) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < row.rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200"
              )}
            />
          ))}
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (row: ProductReview) => (
        <div>
          <div className="font-medium">{row.product?.name || "Unknown"}</div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Customer",
      render: (row: ProductReview) => (
        <div>
          <div className="font-medium">{row.user_name || "Anonymous"}</div>
          {row.user_email && (
            <div className="text-xs text-muted-foreground">{row.user_email}</div>
          )}
        </div>
      ),
    },
    {
      key: "comment",
      header: "Review",
      render: (row: ProductReview) => (
        <div className="max-w-[300px]">
          {row.title && (
            <div className="font-medium text-sm">{row.title}</div>
          )}
          <div className="text-sm text-muted-foreground line-clamp-2">
            {row.comment}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: ProductReview) => (
        <div className="flex flex-col gap-1">
          {row.is_approved ? (
            <Badge variant="default" className="bg-green-600">
              Approved
            </Badge>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          )}
          {row.is_featured && (
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              Featured
            </Badge>
          )}
          {row.is_verified_purchase && (
            <Badge variant="outline" className="border-blue-500 text-blue-600">
              Verified
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row: ProductReview) => (
        <div className="text-sm text-muted-foreground">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A"}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ProductReview) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <span>⋯</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => viewReview(row)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!row.is_approved ? (
              <DropdownMenuItem onClick={() => handleApproval(row.id, true)}>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Approve
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleApproval(row.id, false)}>
                <X className="mr-2 h-4 w-4 text-red-600" />
                Reject
              </DropdownMenuItem>
            )}
            {!row.is_featured ? (
              <DropdownMenuItem onClick={() => handleFeatured(row.id, true)}>
                <Star className="mr-2 h-4 w-4 text-amber-500" />
                Feature
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleFeatured(row.id, false)}>
                <Star className="mr-2 h-4 w-4" />
                Unfeature
              </DropdownMenuItem>
            )}
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

  // Stats
  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;
  const featuredCount = reviews.filter((r) => r.is_featured).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage customer reviews and ratings
          </p>
        </div>
        <Button variant="outline" onClick={fetchReviews} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold">{reviews.length}</div>
          <div className="text-sm text-muted-foreground">Total Reviews</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">Pending Approval</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <span className="text-2xl font-bold">{avgRating}</span>
          </div>
          <div className="text-sm text-muted-foreground">Average Rating</div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">
            Customer reviews will appear here once they start submitting them
          </p>
        </div>
      ) : (
        <DataTable
          data={reviews}
          columns={columns}
          searchKey="comment"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the review.
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

      {/* View Review Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Full review information
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Product</div>
                <div className="font-medium">
                  {selectedReview.product?.name || "Unknown Product"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Customer</div>
                <div className="font-medium">{selectedReview.user_name}</div>
                {selectedReview.user_email && (
                  <div className="text-sm text-muted-foreground">
                    {selectedReview.user_email}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Rating</div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < selectedReview.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200"
                      )}
                    />
                  ))}
                  <span className="ml-2 font-medium">{selectedReview.rating}/5</span>
                </div>
              </div>
              {selectedReview.title && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Title</div>
                  <div className="font-medium">{selectedReview.title}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Comment</div>
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  {selectedReview.comment}
                </div>
              </div>
              <div className="flex gap-2">
                {selectedReview.is_verified_purchase && (
                  <Badge variant="outline" className="border-blue-500 text-blue-600">
                    Verified Purchase
                  </Badge>
                )}
                {selectedReview.is_approved ? (
                  <Badge className="bg-green-600">Approved</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
                {selectedReview.is_featured && (
                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Submitted on {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleString() : "Unknown"}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                {!selectedReview.is_approved ? (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApproval(selectedReview.id, true);
                      setViewDialogOpen(false);
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleApproval(selectedReview.id, false);
                      setViewDialogOpen(false);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleDelete(selectedReview.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
