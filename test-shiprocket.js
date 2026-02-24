

async function test() {
  const email = "tabrezkhanloyola@gmail.com";
  const password = "quSxA8hzPFm0IyZod9dE7vf$uB0Um40x";

  // Login
  const loginRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  console.log("Token:", token.substring(0, 10) + "...");

  // Fetch from local API
  const localRes = await fetch(`http://localhost:3000/api/shiprocket/shipments?token=${token}&per_page=100`);
  console.log("Local Status:", localRes.status);
  const localText = await localRes.text();
  console.log("Local Body:", localText);
}
test().catch(console.error);
