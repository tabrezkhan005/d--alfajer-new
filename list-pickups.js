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

async function listPickups() {
  const email = getEnv('SHIPROCKET_EMAIL');
  const password = getEnv('SHIPROCKET_PASSWORD');

  const authResp = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const authData = await authResp.json();
  const token = authData.token;

  const resp = await fetch("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });

  const data = await resp.json();
  if (data.data && data.data.shipping_address) {
    console.log("Registered Pickup Locations (Names to use in .env):");
    data.data.shipping_address.forEach(addr => {
      console.log(`- ${addr.pickup_location}`);
    });
  } else {
    console.log("No pickup locations found or unexpected response.");
    console.log(JSON.stringify(data, null, 2));
  }
}

listPickups();
