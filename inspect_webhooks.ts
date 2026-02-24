import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWebhooks() {
  const { data, error } = await supabase
    .from("shiprocket_webhook_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching logs:", error);
    return;
  }

  console.log("Latest Webhook Logs:");
  data.forEach(log => {
      console.log(`ID: ${log.id}`);
      console.log(`AWB: ${log.awb_code}`);
      console.log(`Status: ${log.status}`);
      console.log(`Payload snippet: ${JSON.stringify(log.payload).substring(0, 300)}...`);
      console.log("---");
  });
}

checkWebhooks();
