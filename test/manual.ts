async function runManualTests() {
  const BASE_URL = 'http://localhost:3000/api';

  try {
    console.log("Menjalankan test mandiri ke", BASE_URL, "...\n");

    console.log("--- GET /api/health ---");
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log("Status:", healthRes.status);
    console.log("Response:", JSON.stringify(healthData, null, 2));
    console.log("\n");

    console.log("--- GET /api/kitchens ---");
    const kitchenRes = await fetch(`${BASE_URL}/kitchens`);
    const kitchenData = await kitchenRes.json();
    console.log("Status:", kitchenRes.status);
    console.log("Response:", JSON.stringify(kitchenData, null, 2));
    console.log("\n");

    console.log("--- GET /api/foods?status=AVAILABLE ---");
    const foodsRes = await fetch(`${BASE_URL}/foods?status=AVAILABLE`);
    const foodsData = await foodsRes.json();
    console.log("Status:", foodsRes.status);
    console.log("Response:", JSON.stringify(foodsData, null, 2));
    console.log("\n");

  } catch (error: any) {
    console.error("Gagal melakukan request! Pastikan development server sudah berjalan.");
    console.error("Error Detail:", error.message);
  }
}

runManualTests();
