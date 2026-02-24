const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Humanized, SEO-optimized review templates. We will replace {product_name}
const positiveReviews = [
  "Absolutely love this {product_name}! The quality is outstanding and it arrived perfectly packaged. Highly recommend for anyone looking for authentic products online.",
  "This {product_name} exceeded my expectations. So fresh and flavorful. Definitely my new go-to store for premium quality.",
  "Very impressed with the fast delivery and the amazing taste of the {product_name}. You can really tell it's sourced ethically.",
  "I've bought {product_name} from several places before, but the quality here is unmatched. 100% genuine and worth every penny!",
  "Such a great purchase. The {product_name} is exactly as described, incredibly pure, and smells divine. Will be buying again soon.",
  "Fantastic product! The organic {product_name} is a game changer for my daily routine. Love the beautiful packaging too.",
  "Top-notch quality! I was hesitant to buy {product_name} online, but Al Fajer delivered a premium, fresh product right to my door.",
  "If you want the real deal, this {product_name} is it. Tastes exactly like what I used to get back home. Beautifully authentic.",
  "5 stars! The aroma of this {product_name} hits you as soon as you open the box. Premium grade and highly satisfying.",
  "Really happy with my order. The {product_name} is fresh, potent, and clearly handled with care. Excellent customer service as well!",
  "Cannot recommend this {product_name} enough. The taste is incredibly rich and smooth. A huge upgrade over supermarket brands.",
  "This {product_name} makes a perfect gift! The packaging is luxurious and the product itself is of the highest caliber.",
  "I appreciate that this {product_name} is organic and natural. The health benefits are amazing and it tastes wonderful.",
  "Best {product_name} I have tried in a long time. It’s hard to find such pure ingredients these days. Highly trusted brand.",
  "Exceptional flavor profile on the {product_name}. You can really taste the authenticity and freshness in every single bite.",
];

const customerNames = [
  "Aarav S.", "Priya M.", "Zaid K.", "Fatima R.", "Rahul T.",
  "Sneha P.", "Omar A.", "Aisha D.", "Vikram C.", "Neha B.",
  "Sameer H.", "Zara S.", "Karan V.", "Roshni M.", "Aditya N.",
  "Tanya J.", "Imran Q.", "Sana F.", "Kabir L.", "Meera W."
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateReviews() {
  console.log("Fetching products...");
  const { data: products, error: productError } = await supabase.from('products').select('id, name');

  if (productError || !products) {
    console.error("Error fetching products:", productError);
    return;
  }

  console.log(`Found ${products.length} products. Generating reviews...`);

  const reviewsToInsert = [];

  // Aiming for 40-50 total reviews. Let's do roughly 3-4 per product
  for (const product of products) {
    const numReviews = getRandomInt(2, 4);

    for (let i = 0; i < numReviews; i++) {
        const rating = getRandomInt(4, 5); // 4 or 5 stars
        let commentTemplate = getRandomItem(positiveReviews);
        // Clean product name (remove sizes or weights if possible for better flow)
        let cleanName = product.name.split('-')[0].split(',')[0].trim();
        const comment = commentTemplate.replace(/{product_name}/g, cleanName);

        // Random date within the last 30 days
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - getRandomInt(1, 30));

        reviewsToInsert.push({
            product_id: product.id,
            user_id: null, // Guest reviews
            rating: rating,
            comment: comment,
            user_name: getRandomItem(customerNames),
            is_verified_purchase: Math.random() > 0.3, // 70% verified
            status: "approved",
            created_at: pastDate.toISOString()
        });
    }
  }

  console.log(`Generated ${reviewsToInsert.length} reviews. Inserting into database...`);

  // Batch insert
  const { error: insertError } = await supabase.from('reviews').insert(reviewsToInsert);

  if (insertError) {
      console.error("Failed to insert reviews:", insertError);
  } else {
      console.log("✅ Successfully inserted all mock reviews!");

      // Update the product averages quickly
      for (const product of products) {
         const productReviews = reviewsToInsert.filter(r => r.product_id === product.id);
         const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
         const avgRating = totalRating / productReviews.length;

         await supabase.from('products').update({
             rating: avgRating,
             review_count: productReviews.length
         }).eq('id', product.id);
      }
      console.log("✅ Successfully updated product aggregate ratings!");
  }
}

generateReviews();
