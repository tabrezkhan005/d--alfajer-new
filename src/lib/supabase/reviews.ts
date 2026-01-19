"use client";

import { createClient } from "./client";

// Interface matching the actual database schema
export interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string | null;
  user_name: string | null;
  user_email: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean | null;
  is_verified_purchase: boolean | null;
  is_approved: boolean | null;
  is_featured: boolean | null;
  helpful_count: number | null;
  images: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

// Get all reviews for admin (including unapproved)
export async function getAdminReviews(): Promise<ProductReview[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .select(`
      *,
      product:products(id, name, slug)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }

  return (data || []) as unknown as ProductReview[];
}

// Get reviews for a specific product (only approved)
export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching product reviews:", error);
    throw error;
  }

  return (data || []) as unknown as ProductReview[];
}

// Create a new review
export async function createReview(reviewData: {
  product_id: string;
  customer_id?: string;
  user_name: string;
  user_email?: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase?: boolean;
}): Promise<ProductReview> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: reviewData.product_id,
      customer_id: reviewData.customer_id || null,
      user_name: reviewData.user_name,
      user_email: reviewData.user_email || null,
      rating: reviewData.rating,
      title: reviewData.title || null,
      comment: reviewData.comment,
      is_verified: false,
      is_verified_purchase: reviewData.is_verified_purchase || false,
      is_approved: false, // Reviews need approval
      is_featured: false,
      helpful_count: 0,
      images: [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    throw error;
  }

  return data as unknown as ProductReview;
}

// Update review approval status
export async function updateReviewApproval(
  reviewId: string,
  isApproved: boolean
): Promise<ProductReview> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .update({
      is_approved: isApproved,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    console.error("Error updating review approval:", error);
    throw error;
  }

  return data as unknown as ProductReview;
}

// Update review featured status
export async function updateReviewFeatured(
  reviewId: string,
  isFeatured: boolean
): Promise<ProductReview> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .update({
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    console.error("Error updating review featured status:", error);
    throw error;
  }

  return data as unknown as ProductReview;
}

// Delete a review
export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

// Mark review as helpful (simple increment)
export async function markReviewHelpful(reviewId: string): Promise<void> {
  const supabase = createClient();

  // Get current count
  const { data: review, error: fetchError } = await supabase
    .from("product_reviews")
    .select("helpful_count")
    .eq("id", reviewId)
    .single();

  if (fetchError) {
    console.error("Error fetching review:", fetchError);
    throw fetchError;
  }

  // Increment
  const { error: updateError } = await supabase
    .from("product_reviews")
    .update({
      helpful_count: (review?.helpful_count || 0) + 1,
    })
    .eq("id", reviewId);

  if (updateError) {
    console.error("Error updating helpful count:", updateError);
    throw updateError;
  }
}

// Get review stats for a product
export async function getProductReviewStats(productId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  if (error) {
    console.error("Error fetching review stats:", error);
    throw error;
  }

  const reviews = data || [];
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingDistribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  reviews.forEach((r) => {
    ratingDistribution[r.rating]++;
  });

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution,
  };
}
