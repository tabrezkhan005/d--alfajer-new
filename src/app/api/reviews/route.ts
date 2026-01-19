import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { product_id, user_name, user_email, rating, title, comment } = body;

    // Validate required fields
    if (!product_id || !user_name || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: product_id, user_name, rating, comment" },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get authenticated user if available
    const { data: { user } } = await supabase.auth.getUser();

    // Check if this user has already reviewed this product
    if (user) {
      const { data: existingReview } = await supabase
        .from("product_reviews")
        .select("id")
        .eq("product_id", product_id)
        .eq("customer_id", user.id)
        .single();

      if (existingReview) {
        return NextResponse.json(
          { error: "You have already reviewed this product" },
          { status: 400 }
        );
      }
    }

    // Check if user has purchased this product (for verified purchase badge)
    let isVerifiedPurchase = false;
    if (user) {
      const { data: order } = await supabase
        .from("order_items")
        .select("id, order:orders!inner(customer_id)")
        .eq("product_id", product_id)
        .eq("order.customer_id", user.id)
        .limit(1)
        .single();

      isVerifiedPurchase = !!order;
    }

    // Create the review
    const { data: review, error } = await supabase
      .from("product_reviews")
      .insert({
        product_id,
        customer_id: user?.id || null,
        user_name,
        user_email: user_email || user?.email || null,
        rating,
        title: title || null,
        comment,
        is_verified: false,
        is_verified_purchase: isVerifiedPurchase,
        is_approved: false, // Reviews require admin approval
        is_featured: false,
        helpful_count: 0,
        images: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully! It will be visible after approval.",
      review,
    });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    // Calculate stats
    const totalReviews = reviews?.length || 0;
    const averageRating =
      totalReviews > 0
        ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews?.forEach((r) => {
      ratingDistribution[r.rating]++;
    });

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Review fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
