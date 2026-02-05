const fs = require('fs');
const path = require('path');

function getEnv(key) {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith(`${key}=`)) {
      let value = line.split('=')[1].trim();
      if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  return null;
}

async function createTestShipment() {
  const email = getEnv('SHIPROCKET_EMAIL');
  const password = getEnv('SHIPROCKET_PASSWORD');

  console.log("1. Authenticating...");
  const authResp = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const authData = await authResp.json();
  if (!authData.token) {
    console.error("Auth failed:", authData);
    return;
  }
  const token = authData.token;
  console.log("✅ Authenticated.");

  const shipmentData = {
    order_id: "TEST-ORDER-" + Date.now(),
    order_date: new Date().toISOString().split('T')[0],
    pickup_location: "Home-1",
    billing_customer_name: "Tabrez",
    billing_last_name: "Khan",
    billing_address: "Alinagar",
    billing_city: "Guntur",
    billing_pincode: "522001",
    billing_state: "Andhra Pradesh",
    billing_country: "India",
    billing_email: "tabrezkhangnt@gmail.com",
    billing_phone: "9391773656",
    shipping_is_billing: true,
    order_items: [
      {
        name: "Test item",
        sku: "TEST-SKU",
        units: 1,
        selling_price: 100
      }
    ],
    payment_method: "Prepaid",
    sub_total: 100,
    weight: 0.5,
    length: 10,
    breadth: 10,
    height: 10
  };

  console.log("2. Creating shipment...");
  const createResp = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(shipmentData),
  });

  const createData = await createResp.json();
  console.log("Status:", createResp.status);
  console.log("Response:", JSON.stringify(createData, null, 2));
}

createTestShipment();
