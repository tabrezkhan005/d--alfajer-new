const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getProduct() {
  const { data, error } = await supabase.from('products').select('*').limit(1).single();
  if (error) {
    console.error("Error fetching product:", error);
    return;
  }

  const fs = require('fs');
  fs.writeFileSync('temp-product.json', JSON.stringify(data));
}

getProduct();
