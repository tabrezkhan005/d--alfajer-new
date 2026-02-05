import { getShiprocketToken } from "./src/lib/shiprocket";
import * as dotenv from "dotenv";

dotenv.config();

async function testAuth() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  console.log("Testing Shiprocket Auth for:", email);
  const result = await getShiprocketToken(email!, password!);
  console.log("Result:", result);
}

testAuth();
