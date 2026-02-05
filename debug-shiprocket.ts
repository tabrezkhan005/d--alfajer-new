import { getShiprocketToken } from "./src/lib/shiprocket";
import * as dotenv from "dotenv";

dotenv.config();

async function testAuth() {
  const email = process.env.SHIPROCKET_EMAIL;
  let password = process.env.SHIPROCKET_PASSWORD || "";

  // Strip quotes if they are literally in the string (happens on some Windows setups)
  if (password.startsWith("'") && password.endsWith("'")) {
    password = password.slice(1, -1);
  }

  console.log("Checking credentials...");
  console.log("Email:", email);
  console.log("Password length:", password.length);
  console.log("Password starts with:", password[0]);

  const result = await getShiprocketToken(email!, password);
  console.log("Login Result:", JSON.stringify(result));
}

testAuth().catch(console.error);
