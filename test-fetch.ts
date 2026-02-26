import { getProducts } from './src/lib/supabase/products-server';

async function test() {
  try {
    const products = await getProducts();
    console.log("Products length:", products.length);
  } catch (err) {
    console.error("Test error:", err);
  }
}
test();
