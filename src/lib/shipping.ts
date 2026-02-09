// Shipping Zones and Rates Configuration
// North India Zone: ₹50 per piece
// Rest of India: ₹80 per piece
// International: $35 per kg

export interface ShippingZone {
  id: string;
  name: string;
  states: string[];
  ratePerPiece: number; // in INR
  currency: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  extraCostPerPiece: number; // in INR
  availableForInternational: boolean;
}

// North India Zone States
export const NORTH_INDIA_STATES = [
  // States
  "Delhi",
  "Delhi (NCT)",
  "NCT of Delhi",
  "Haryana",
  "Punjab",
  "Himachal Pradesh",
  "Uttarakhand",
  "Rajasthan",
  "Uttar Pradesh",
  // Union Territories
  "Chandigarh",
  "Jammu & Kashmir",
  "Jammu and Kashmir",
  "Ladakh",
];

// All Indian States/UTs for validation
export const ALL_INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Delhi (NCT)",
  "NCT of Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
];

// Shipping Zones
export const shippingZones: Record<string, ShippingZone> = {
  northIndia: {
    id: "northIndia",
    name: "North India",
    states: NORTH_INDIA_STATES,
    ratePerPiece: 50, // ₹50 per piece
    currency: "INR",
  },
  restOfIndia: {
    id: "restOfIndia",
    name: "Rest of India",
    states: ALL_INDIAN_STATES.filter(
      (state) => !NORTH_INDIA_STATES.map(s => s.toLowerCase()).includes(state.toLowerCase())
    ),
    ratePerPiece: 80, // ₹80 per piece
    currency: "INR",
  },
  international: {
    id: "international",
    name: "International",
    states: [], // Any country other than India
    ratePerPiece: 35 * 84, // $35 per kg, roughly converted to INR (will be shown in USD)
    currency: "USD",
  },
};

// Shipping Speed Options
export const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "2-3 business days",
    estimatedDays: "2-3 days",
    extraCostPerPiece: 0,
    availableForInternational: true,
  },
  {
    id: "overnight",
    name: "Overnight Delivery",
    description: "Next business day",
    estimatedDays: "1 day",
    extraCostPerPiece: 50, // Extra ₹50 per piece
    availableForInternational: false, // Not available for international
  },
];

// Free shipping threshold (in respective currencies)
export const FREE_SHIPPING_THRESHOLD = {
  INR: 999,
  USD: 12, // ~₹999
  AED: 44, // ~₹999
  GBP: 10, // ~₹999
  EUR: 11, // ~₹999
  SAR: 45, // ~₹999
};

// Pincode to City/State mapping for India
export interface PincodeData {
  city: string;
  state: string;
  district?: string;
  country?: string;
  countryCode?: string;
}

// Common pincode prefixes for quick lookup
const PINCODE_STATE_MAP: Record<string, string> = {
  "11": "Delhi",
  "12": "Haryana",
  "13": "Haryana",
  "14": "Punjab",
  "15": "Punjab",
  "16": "Punjab",
  "17": "Himachal Pradesh",
  "18": "Jammu & Kashmir",
  "19": "Jammu & Kashmir",
  "20": "Uttar Pradesh",
  "21": "Uttar Pradesh",
  "22": "Uttar Pradesh",
  "23": "Uttar Pradesh",
  "24": "Uttarakhand",
  "25": "Uttarakhand",
  "26": "Uttar Pradesh",
  "27": "Uttar Pradesh",
  "28": "Uttar Pradesh",
  "30": "Rajasthan",
  "31": "Rajasthan",
  "32": "Rajasthan",
  "33": "Rajasthan",
  "34": "Rajasthan",
  "36": "Gujarat",
  "37": "Gujarat",
  "38": "Gujarat",
  "39": "Gujarat",
  "40": "Maharashtra",
  "41": "Maharashtra",
  "42": "Maharashtra",
  "43": "Maharashtra",
  "44": "Maharashtra",
  "45": "Madhya Pradesh",
  "46": "Madhya Pradesh",
  "47": "Madhya Pradesh",
  "48": "Madhya Pradesh",
  "49": "Chhattisgarh",
  "50": "Telangana",
  "51": "Telangana",
  "52": "Andhra Pradesh",
  "53": "Andhra Pradesh",
  "56": "Karnataka",
  "57": "Karnataka",
  "58": "Karnataka",
  "59": "Karnataka",
  "60": "Tamil Nadu",
  "61": "Tamil Nadu",
  "62": "Tamil Nadu",
  "63": "Tamil Nadu",
  "64": "Tamil Nadu",
  "67": "Kerala",
  "68": "Kerala",
  "69": "Kerala",
  "70": "West Bengal",
  "71": "West Bengal",
  "72": "West Bengal",
  "73": "West Bengal",
  "74": "West Bengal",
  "75": "Odisha",
  "76": "Odisha",
  "77": "Odisha",
  "78": "Assam",
  "79": "Assam",
  "80": "Bihar",
  "81": "Bihar",
  "82": "Bihar",
  "83": "Bihar",
  "84": "Bihar",
  "85": "Jharkhand",
  // Note: Chandigarh (160xxx) is handled specially in getStateFromPincode function
};

// Function to get state from pincode prefix
export function getStateFromPincode(pincode: string): string | null {
  if (!pincode || pincode.length < 2) return null;

  const prefix = pincode.substring(0, 2);

  // Special case for Chandigarh (160xxx)
  if (pincode.startsWith("160")) {
    return "Chandigarh";
  }

  // Special case for Delhi (110xxx)
  if (pincode.startsWith("110") || pincode.startsWith("11")) {
    return "Delhi";
  }

  return PINCODE_STATE_MAP[prefix] || null;
}

// Function to fetch pincode details from API
export async function fetchPincodeDetails(pincode: string, countryCode: string = "IN"): Promise<PincodeData | null> {
  if (!pincode || pincode.length < 3) return null;

  try {
    // Use Zippopotam.us API which supports multiple countries
    // URL format: https://api.zippopotam.us/{country}/{zip}
    const response = await fetch(`https://api.zippopotam.us/${countryCode}/${pincode}`);

    if (!response.ok) {
       return null;
    }

    const data = await response.json();

    if (data && data.places && data.places.length > 0) {
      const place = data.places[0];

      // Clean up city name (sometimes API returns "New Delhi G.P.O." or "Area Name (West)")
      // We generally want just the main city name if possible, but Zippopotam usually gives the specific area name for the postal code.
      // For shipping purposes, the primary city/town is usually preferred.
      // Zippopotam doesn't separate "City" and "Area" cleanly in 'place name'.
      // However, for India, 'place name' is often the specific post office area.
      // We will use 'place name' as city for now as it's the most granular data available.

      return {
        city: place["place name"],
        state: place["state"],
        district: place["place name"],
        country: data["country"],
        countryCode: data["country abbreviation"]
      };
    }

    // Fallback only for India if API fails
    if (countryCode === "IN") {
      const state = getStateFromPincode(pincode);
      if (state) {
        return {
          city: "",
          state: state,
          district: "",
          country: "India",
          countryCode: "IN"
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching pincode details:", error);

    // Fallback only for India
    if (countryCode === "IN") {
      const state = getStateFromPincode(pincode);
      if (state) {
        return {
          city: "",
          state: state,
          district: "",
          country: "India",
          countryCode: "IN"
        };
      }
    }

    return null;
  }
}

// Function to determine shipping zone
export function getShippingZone(country: string, state?: string): ShippingZone {
  // If not India, return international
  if (country !== "IN" && country !== "India") {
    return shippingZones.international;
  }

  // Check if state is in North India
  if (state) {
    const normalizedState = state.toLowerCase().trim();
    const isNorthIndia = NORTH_INDIA_STATES.some(
      (s) => s.toLowerCase() === normalizedState
    );

    if (isNorthIndia) {
      return shippingZones.northIndia;
    }
  }

  // Default to Rest of India
  return shippingZones.restOfIndia;
}

// Calculate shipping cost
export interface ShippingCalculationResult {
  zone: ShippingZone;
  baseRate: number;
  baseCost: number;
  shippingOption: ShippingOption;
  shippingOptionCost: number;
  totalShippingCost: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  amountForFreeShipping: number;
  currency: string;
  rateDisplay: string;
}

export function calculateShippingCost(
  country: string,
  state: string,
  totalItemCount: number,
  totalWeight: number, // in kg
  subtotal: number,
  currency: string = "INR",
  shippingOptionId: string = "standard"
): ShippingCalculationResult {
  const zone = getShippingZone(country, state);
  const shippingOption = shippingOptions.find((o) => o.id === shippingOptionId) || shippingOptions[0];

  // Check if overnight is available
  const effectiveShippingOption =
    shippingOptionId === "overnight" && zone.id === "international"
      ? shippingOptions[0] // Fall back to standard for international
      : shippingOption;

  // Get free shipping threshold for currency
  const freeThreshold = FREE_SHIPPING_THRESHOLD[currency as keyof typeof FREE_SHIPPING_THRESHOLD] || FREE_SHIPPING_THRESHOLD.INR;

  // Check if eligible for free shipping
  // Standard logic: Free if subtotal >= threshold
  const isFreeShipping = subtotal >= freeThreshold;

  let baseCost = 0;
  let shippingOptionCost = 0;
  let rateDisplay = "";

  if (zone.id === "international") {
    // International: $35 per kg
    baseCost = 35 * totalWeight;
    rateDisplay = `$35 per kg`;
    // Convert to requested currency if not USD
    if (currency !== "USD") {
      // Rough conversion rate (should use actual rates in production)
      baseCost = baseCost * 84; // USD to INR
    }
  } else {
    // India: Rate per piece
    baseCost = zone.ratePerPiece * totalItemCount;
    rateDisplay = `₹${zone.ratePerPiece} per piece`;

    // Add overnight cost if applicable
    if (effectiveShippingOption.id === "overnight") {
      shippingOptionCost = effectiveShippingOption.extraCostPerPiece * totalItemCount;
    }
  }

  const totalShippingCost = isFreeShipping ? 0 : baseCost + shippingOptionCost;

  return {
    zone,
    baseRate: zone.ratePerPiece,
    baseCost,
    shippingOption: effectiveShippingOption,
    shippingOptionCost,
    totalShippingCost,
    isFreeShipping,
    freeShippingThreshold: freeThreshold,
    amountForFreeShipping: freeThreshold - subtotal,
    currency: zone.id === "international" ? "USD" : currency,
    rateDisplay,
  };
}

// Get available shipping options for a destination
export function getAvailableShippingOptions(country: string): ShippingOption[] {
  if (country !== "IN" && country !== "India") {
    // International - only standard
    return shippingOptions.filter((o) => o.availableForInternational);
  }

  // India - all options available
  return shippingOptions;
}
