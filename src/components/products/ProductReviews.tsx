"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { getProductReviews, createReview, type ProductReview } from "@/src/lib/supabase/reviews";
import { useAuth } from "@/src/lib/auth-context";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { t } = useI18n();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sortBy, setSortBy] = useState<'helpful' | 'recent' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getProductReviews(productId);
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      const userEmail = user?.email || "guest@example.com";
      const userName = user?.name || (document.getElementById('guest-name') as HTMLInputElement)?.value || "Anonymous";

      await createReview({
        product_id: productId,
        customer_id: user?.id || `guest_${Date.now()}`,
        user_name: userName,
        user_email: userEmail,
        rating: formRating,
        title: title || undefined,
        comment,
        is_verified_purchase: !!user // Only verified if logged in
      });
      toast.success("Review submitted! It will appear after approval.");
      setShowForm(false);
      setTitle("");
      setComment("");
      setFormRating(5);

      // Reload reviews
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and Sort logic
  const filteredReviews = reviews
    .filter(review => !filterRating || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return (Number(b.helpful_count) || 0) - (Number(a.helpful_count) || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    return {
       rating,
       count,
       percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
    };
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold mb-2">{avgRating}</div>
            <div className="flex justify-center mb-2 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={
                    i < Math.round(parseFloat(avgRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">{reviews.length} {t('product.reviews') || 'Reviews'}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="w-12 text-sm font-medium text-right">{rating}★</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-600">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterRating === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRating(null)}
          >
            All
          </Button>
          {[5, 4, 3, 2, 1].map(rating => (
            <Button
              key={rating}
              variant={filterRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(rating)}
            >
              {rating}★
            </Button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* Write Review Section */}
      {!showForm ? (
        <Button size="lg" className="w-full" onClick={() => setShowForm(true)}>
          {t('product.writeReview') || 'Write a Review'}
        </Button>
      ) : (
        <Card className="border-2 border-[#009744]/20">
            <CardContent className="pt-6 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                   <h4 className="font-bold text-lg">Write your review</h4>

                   {!user && (
                     <div className="space-y-2">
                       <Label>Your Name</Label>
                       <Input
                         id="guest-name"
                         placeholder="Enter your name"
                         required
                       />
                     </div>
                   )}

                   <div className="space-y-2">
                       <Label>Rating</Label>
                       <div className="flex gap-2">
                           {[1, 2, 3, 4, 5].map(star => (
                               <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFormRating(star)}
                                  className="focus:outline-none"
                               >
                                   <Star
                                      size={24}
                                      className={star <= formRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                                   />
                               </button>
                           ))}
                       </div>
                   </div>

                   <div className="space-y-2">
                       <Label>Title (Optional)</Label>
                       <Input
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="Review title"
                       />
                   </div>

                   <div className="space-y-2">
                       <Label>Review</Label>
                       <Textarea
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          placeholder="Tell us what you liked or disliked..."
                          required
                       />
                   </div>

                   <div className="flex gap-2 justify-end">
                       <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                       <Button type="submit" disabled={isSubmitting}>
                           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           Submit Review
                       </Button>
                   </div>
                </form>
            </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
        ) : (
            filteredReviews.map((review) => (
            <Card key={review.id}>
                <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                    <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                            key={i}
                            size={16}
                            className={
                                i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }
                            />
                        ))}
                        </div>
                        {review.is_verified_purchase && (
                        <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                            ✓ Verified Purchase
                        </Badge>
                        )}
                    </div>
                    <h4 className="font-semibold">{review.title}</h4>
                    <p className="text-sm text-gray-600">
                        {review.user_name || "Anonymous"} • {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                    </p>
                    </div>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled
                >
                    <ThumbsUp size={16} />
                    Helpful ({review.helpful_count || 0})
                </Button>
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}
