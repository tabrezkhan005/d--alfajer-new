const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SEO Optimized Content Pools
const firstNames = ["Ahmed", "Sarah", "Mohammed", "Fatima", "Ali", "Aisha", "Omar", "Zainab", "Hassan", "Maryam", "John", "David", "Priya", "Rahul", "Anita", "Michael", "Emma", "Tariq", "Salma", "Nadia", "Raj", "Neha", "Abdul", "Yasmin", "Khalid", "Layla", "Vikram", "Sneha", "James", "Elena"];
const lastNames = ["Khan", "Al Maktoum", "Patel", "Smith", "Rahman", "Abdullah", "Desai", "Sharma", "Hussain", "Joshi", "Ali", "Williams", "Kumar", "Iyer", "Brown", "Syed", "Singh", "Das", "Ahmed", "Mahmoud", "Farooq", "Rao", "Nair", "Fernandes", "Garcia", "Bhatt", "Reddy", "Shah"];

const seoTitles = [
  "Premium Quality and Fast Delivery",
  "Authentic Taste, Highly Recommended",
  "Best in the UAE!",
  "100% Organic and Fresh",
  "Amazing Value for Money",
  "Exceeded My Expectations",
  "Perfect for Healthy Living",
  "My Go-To Store for Premium Goods",
  "Top Notch Quality",
  "Absolutely Delicious",
  "Incredible Aromas and Freshness",
  "A Must-Buy for Everyone",
  "Great Packaging and Safe Delivery",
  "Five Stars from Me!",
  "Simply the Best Quality Available",
  "Pure, Authentic, and Healthy",
  "Will Definitely Order Again",
  "Unbeatable Freshness",
  "Excellent Customer Service and Product",
  "Highly Satisfied Customer"
];

const seoComments = [
  "I am extremely satisfied with this purchase. The quality is truly premium, and it arrived super fast here in Dubai. I highly recommend Alfajer for anyone looking for authentic, organic products!",
  "This is by far the best quality I have found in the UAE. You can tell it's 100% natural and organic. The packaging was secure, and the taste is phenomenal. 5 stars!",
  "Absolutely top-notch! The authenticity and freshness are unmatched. It has become a staple in my healthy diet. Fast shipping and great customer service to top it off.",
  "I've tried many brands, but this one stands out. The premium quality is evident from the first use. Highly recommended for anyone who values health and authentic taste.",
  "Wonderful product. Exactly as described. Arrived perfectly packaged and the quality is exceptional. Best organic store in the Middle East!",
  "I'm a repeat customer because the quality is consistently amazing. The delivery is always fast, and the products are always fresh. Highly recommend!",
  "This exceeded all my expectations. The aroma and flavor are incredibly rich. You get incredible value for such premium quality. Will be buying more soon.",
  "If you want 100% authentic and premium quality, buy this. It is fresh, organic, and perfectly packaged. Alfajer never disappoints!",
  "Incredible quality! Finding genuinely authentic and pure products can be hard, but this is the real deal. Arrived very quickly in perfect condition.",
  "I love that these products are completely organic and free of preservatives. The taste is pure and authentic. A fantastic addition to my daily routine."
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDateWithinPastYear() {
  const end = new Date();
  const start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

async function run() {
  console.log("Fetching products...");
  const { data: products, error } = await supabase.from('products').select('id, name');

  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products. Generating 2-3 reviews for each...`);

  let totalInserted = 0;

  for (const product of products) {
    const reviews = [];
    const numReviews = Math.floor(Math.random() * 2) + 2; // either 2 or 3

    for (let i = 0; i < numReviews; i++) {
        // 80% chance of 5 stars, 20% chance of 4 stars
        const rating = Math.random() > 0.2 ? 5 : 4;

        const firstName = getRandomItem(firstNames);
        const lastName = getRandomItem(lastNames);
        const name = `${firstName} ${lastName}`;
        // Randomly include an email or not
        const email = Math.random() > 0.5 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random()*100)}@gmail.com` : null;

        // Modifying the base comment slightly to include the product name occasionally for SEO
        let comment = getRandomItem(seoComments);
        if (Math.random() > 0.7) {
            comment = comment.replace("this purchase", `this ${product.name}`);
        } else if (Math.random() > 0.7) {
            comment = comment.replace("this", `this ${product.name}`);
        }

        reviews.push({
            product_id: product.id,
            rating: rating,
            title: getRandomItem(seoTitles),
            comment: comment + `\n\n- ${name}`, // Append name to comment since no column
            is_verified_purchase: true,
            is_approved: true,
            helpful_count: Math.floor(Math.random() * 45),
            created_at: getRandomDateWithinPastYear(),
            updated_at: new Date().toISOString()
        });
    }

    // Insert the 2-3 reviews
    const { error: insertError } = await supabase.from('product_reviews').insert(reviews);

    if (insertError) {
        console.error(`Error inserting reviews for product ${product.name}:`, insertError);
    } else {
        totalInserted += numReviews;
        console.log(`✅ Inserted ${numReviews} reviews for ${product.name}`);
    }
  }

  console.log(`\n🎉 Successfully inserted ${totalInserted} SEO optimized reviews!`);
}

run();
