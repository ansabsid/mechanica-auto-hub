
import { Vehicle } from "@/hooks/useVehicles";
import { fetchWithTimeout, fetchWithCache } from "@/hooks/car-parts/utils/network";

type NhtsaResponse = {
  Results: Array<{
    Variable: string;
    Value: string | null;
  }>;
};

type VinDecoderFallbackResponse = {
  specification: {
    make: string;
    model: string;
    year: number;
    fuel_type: string;
    transmission: string;
    body_type: string;
    engine: {
      displacement: string;
      configuration: string;
    };
  };
  vin: string;
};

/**
 * Fetches vehicle data from the NHTSA VIN decoder API
 * @param vin Vehicle Identification Number
 * @returns Promise resolving to a Vehicle object
 */
export const fetchVehicleByVin = async (vin: string): Promise<Vehicle> => {
  try {
    console.log(`Fetching data for VIN: ${vin}`);
    
    // Try the NHTSA API first
    try {
      const vehicleData = await fetchFromNhtsaApi(vin);
      
      // If we have complete data from NHTSA, return it
      if (vehicleData.make && vehicleData.model && vehicleData.year) {
        console.log("Successfully decoded vehicle using NHTSA API:", vehicleData);
        return vehicleData;
      }
      
      console.log("Incomplete data from NHTSA API, trying fallback API...");
    } catch (error) {
      console.warn("NHTSA API failed, trying fallback API...", error);
    }
    
    // If NHTSA API fails or returns incomplete data, try the fallback API
    const fallbackData = await fetchFromFallbackApi(vin);
    console.log("Successfully decoded vehicle using fallback API:", fallbackData);
    return fallbackData;
    
  } catch (error: any) {
    console.error("Error decoding VIN with both APIs:", error);
    throw new Error(error.message || "Failed to decode VIN");
  }
};

/**
 * Fetches vehicle data from the NHTSA API
 */
const fetchFromNhtsaApi = async (vin: string): Promise<Vehicle> => {
  const response = await fetchWithTimeout(async () => {
    const apiUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }
    
    return await res.json();
  });
  
  const data = response as NhtsaResponse;
  
  if (!data.Results || !Array.isArray(data.Results)) {
    throw new Error("Invalid response format from VIN decoder API");
  }
  
  // Extract the relevant vehicle information from the API response
  const vehicleData = extractVehicleData(data);
  
  return vehicleData;
};

/**
 * Fetches vehicle data from the fallback VIN decoder API
 */
const fetchFromFallbackApi = async (vin: string): Promise<Vehicle> => {
  // Note: In a production app, you would store this API key as an environment variable
  // For demo purposes, we're using a placeholder value
  const apiKey = "YOUR_FALLBACK_API_KEY"; // Replace with actual API key
  
  const response = await fetchWithTimeout(async () => {
    const apiUrl = `https://vindecoderapi.com/v1/decode/${vin}?apikey=${apiKey}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      throw new Error(`Fallback API request failed with status ${res.status}`);
    }
    
    return await res.json();
  });
  
  const data = response as VinDecoderFallbackResponse;
  
  // Map the response to our Vehicle type
  return {
    make: data.specification.make || "",
    model: data.specification.model || "",
    year: data.specification.year || 0,
    vin: data.vin || vin,
    engine_details: {
      type: data.specification.engine.configuration || "",
      size: data.specification.engine.displacement || "",
      fuel: data.specification.fuel_type || ""
    },
    body_style: data.specification.body_type || "",
    transmission: data.specification.transmission || ""
  } as Vehicle;
};

/**
 * Extracts vehicle data from the NHTSA API response
 */
const extractVehicleData = (data: NhtsaResponse): Vehicle => {
  const getValueByVariable = (variable: string): string => {
    const result = data.Results.find(item => item.Variable === variable);
    return result?.Value || "";
  };
  
  // Extract the basic vehicle information
  const make = getValueByVariable("Make");
  const model = getValueByVariable("Model");
  const modelYear = getValueByVariable("Model Year");
  const year = modelYear ? parseInt(modelYear, 10) : 0;
  
  // Extract additional information
  const engineSize = getValueByVariable("Displacement (L)");
  const engineType = getValueByVariable("Engine Configuration");
  const fuelType = getValueByVariable("Fuel Type - Primary");
  const bodyStyle = getValueByVariable("Body Class");
  const transmission = getValueByVariable("Transmission Style");
  
  return {
    make,
    model,
    year,
    vin: getValueByVariable("VIN"),
    engine_details: {
      type: engineType || "",
      size: engineSize || "",
      fuel: fuelType || ""
    },
    body_style: bodyStyle || "",
    transmission: transmission || ""
  } as Vehicle;
};
