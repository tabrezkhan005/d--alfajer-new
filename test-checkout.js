async function testCheckout() {
  console.log("Starting checkout test...");

  const payload = {
    items: [
      {
        id: "b203f543-4ce0-4a6e-a5f9-f20a88689b60",
        productId: "b203f543-4ce0-4a6e-a5f9-f20a88689b60",
        quantity: 1,
        price: 350,
        name: "Kashmiri Kahwa Tea",
      }
    ],
    shippingAddress: {
      firstName: "Test",
      lastName: "User",
      email: "tabrezkhanloyola@gmail.com", // Send to user's email or a test email
      phone: "9999999999",
      address: "123 Test St",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "IN"
    },
    paymentMethod: "cod", // Use COD to trigger auto-ship immediately
    currency: "INR",
    shippingCost: 50
  };

  try {
    const response = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testCheckout();
