const fs = require('fs');
const path = require('path');

function getEnv(key) {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith(`${key}=`)) {
      let value = line.split('=')[1].trim();
      // Remove quotes if present
      if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  return null;
}

async function testAuth() {
  const email = getEnv('SHIPROCKET_EMAIL');
  const password = getEnv('SHIPROCKET_PASSWORD');

  console.log("Testing with:");
  console.log("Email:", email);
  console.log("Password length:", password ? password.length : 0);

  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data));
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}

testAuth();
