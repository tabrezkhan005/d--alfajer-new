"use client";

import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useI18n } from "@/src/components/providers/i18n-provider";

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  date: string;
}

interface ProductReviewsProps {
  productId: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    author: 'John Doe',
    rating: 5,
    title: 'Excellent quality!',
    comment: 'This chilli powder is amazing. Great color, rich flavor, and perfect heat level. Arrived well packaged.',
    verified: true,
    helpful: 24,
    date: '2024-01-10',
  },
  {
    id: '2',
    author: 'Jane Smith',
    rating: 4,
    title: 'Good value for money',
    comment: 'Good product quality. A bit pricey compared to local brands but the taste is superior.',
    verified: true,
    helpful: 18,
    date: '2024-01-05',
  },
  {
    id: '3',
    author: 'Mike Johnson',
    rating: 5,
    title: 'Will buy again',
    comment: 'Very fresh and authentic. This is what real Kashmiri chilli powder should taste like.',
    verified: true,
    helpful: 31,
    date: '2023-12-28',
  },
];

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { t } = useI18n();
  const [sortBy, setSortBy] = useState<'helpful' | 'recent' | 'rating'>('helpful');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredReviews = mockReviews
    .filter(review => !filterRating || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.helpful - a.helpful;
        case 'recent':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: mockReviews.filter(r => r.rating === rating).length,
    percentage: (mockReviews.filter(r => r.rating === rating).length / mockReviews.length) * 100,
  }));

  const avgRating = (mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1);

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
            <p className="text-sm text-gray-600">{mockReviews.length} {t('product.reviews')}</p>
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
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="helpful">Most Helpful</option>
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
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
                    {review.verified && (
                      <Badge variant="outline" className="text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold">{review.title}</h4>
                  <p className="text-sm text-gray-600">
                    {review.author} • {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ThumbsUp size={16} />
                Helpful ({review.helpful})
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Write Review */}
      <Button size="lg" className="w-full">
        Write a Review
      </Button>
    </div>
  );
}
