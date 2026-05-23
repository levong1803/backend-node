import { saveScan } from "./src/firebase/firestore.js";

async function testSave() {
  const uid = "test_user_123";
  const scanData = {
    dateMillis: Date.now(),
    imageUrl: null,
    type: "Facial Skin Analysis",
    score: 85,
    skinAge: 25,
    skinType: "Normal",
    isFallback: false,
    fallbackReason: null,
    detailedMetrics: {
      acne: 80,
      wrinkles: 85,
      hydration: 70,
      texture: 75,
      pores: 65,
      spots: 80
    },
    conditions: [
      { name: "Acne", severity: "Low", confidence: 90 }
    ],
    recommendations: [
      "Use cleanser"
    ]
  };

  try {
    const id = await saveScan(uid, scanData);
    console.log("Successfully saved with ID:", id);
  } catch (error) {
    console.error("Save failed:", error);
  }
}

testSave();
