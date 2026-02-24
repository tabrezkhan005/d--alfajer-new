const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLastOrder() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, tracking_number, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return;
  }

  console.log("Last Order:", JSON.stringify(data, null, 2));
}

checkLastOrder();
