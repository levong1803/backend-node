export const PRODUCTS_DB = [
  {
    id: 1,
    name: "Hyaluronic Acid Serum",
    brand: "The Ordinary",
    price: 29.99,
    rating: 4.8,
    reviews: 2845,
    category: "Serum",
    skinType: "All",
    benefits: ["Hydration", "Plumping"],
    targetConditions: ["Dryness", "Fine Lines"]
  },
  {
    id: 2,
    name: "Retinol 0.5% Night Cream",
    brand: "CeraVe",
    price: 39.99,
    rating: 4.7,
    reviews: 1923,
    category: "Moisturizer",
    skinType: "Normal to Dry",
    benefits: ["Anti-aging", "Fine Lines"],
    targetConditions: ["Fine Lines", "Dark Spots", "Wrinkles"]
  },
  {
    id: 3,
    name: "Vitamin C Brightening Serum",
    brand: "La Roche-Posay",
    price: 49.99,
    rating: 4.9,
    reviews: 3421,
    category: "Serum",
    skinType: "All",
    benefits: ["Brightening", "Dark Spots"],
    targetConditions: ["Dark Spots", "Dullness", "Uneven Tone"]
  },
  {
    id: 4,
    name: "Gentle Hydrating Cleanser",
    brand: "Cetaphil",
    price: 19.99,
    rating: 4.6,
    reviews: 5623,
    category: "Cleanser",
    skinType: "Sensitive",
    benefits: ["Cleansing", "Soothing"],
    targetConditions: ["Redness", "Sensitivity", "Acne"]
  },
  {
    id: 5,
    name: "Mineral Sunscreen SPF 50",
    brand: "Neutrogena",
    price: 24.99,
    rating: 4.8,
    reviews: 2156,
    category: "Sunscreen",
    skinType: "All",
    benefits: ["UV Protection", "Non-greasy"],
    targetConditions: ["Dark Spots", "Sun Damage", "Fine Lines"]
  },
  {
    id: 6,
    name: "Niacinamide Toner",
    brand: "Paula's Choice",
    price: 34.99,
    rating: 4.7,
    reviews: 1789,
    category: "Toner",
    skinType: "Oily to Combination",
    benefits: ["Pore Refining", "Oil Control"],
    targetConditions: ["Acne", "Large Pores", "Oiliness"]
  },
  {
    id: 7,
    name: "Salicylic Acid Cleanser",
    brand: "CeraVe",
    price: 22.99,
    rating: 4.7,
    reviews: 3102,
    category: "Cleanser",
    skinType: "Oily",
    benefits: ["Acne Control", "Exfoliation"],
    targetConditions: ["Acne", "Blackheads", "Oiliness"]
  },
  {
    id: 8,
    name: "Centella Repair Cream",
    brand: "Dr. Jart+",
    price: 45.99,
    rating: 4.8,
    reviews: 2678,
    category: "Moisturizer",
    skinType: "Sensitive",
    benefits: ["Repair", "Calming"],
    targetConditions: ["Redness", "Irritation", "Sensitivity"]
  }
];

export function getAllProducts(category, skinType) {
  let results = PRODUCTS_DB;

  if (category && category.toLowerCase() !== "all") {
    results = results.filter((product) => product.category.toLowerCase() === category.toLowerCase());
  }

  if (skinType && skinType.toLowerCase() !== "all") {
    results = results.filter(
      (product) =>
        product.skinType.toLowerCase() === "all" || product.skinType.toLowerCase().includes(skinType.toLowerCase())
    );
  }

  return results;
}

export function recommendForConditions(conditions) {
  if (!conditions?.length) {
    return PRODUCTS_DB;
  }

  const conditionNames = conditions.map((condition) => condition.toLowerCase());
  const scoredProducts = [];

  for (const product of PRODUCTS_DB) {
    const targets = (product.targetConditions ?? []).map((target) => target.toLowerCase());
    const matchCount = conditionNames.reduce((count, condition) => count + (targets.includes(condition) ? 1 : 0), 0);

    if (matchCount > 0) {
      scoredProducts.push([matchCount, product]);
    }
  }

  scoredProducts.sort((left, right) => right[0] - left[0]);
  return scoredProducts.length > 0 ? scoredProducts.map((entry) => entry[1]) : PRODUCTS_DB.slice(0, 4);
}
