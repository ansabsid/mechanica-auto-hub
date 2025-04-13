
import { Vehicle } from "@/hooks/useVehicles";
import { fetchWithTimeout } from "@/hooks/car-parts/utils/network";

type NhtsaResponse = {
  Results: Array<{
    Variable: string;
    Value: string | null;
  }>;
};

/**
 * Fetches vehicle data from the NHTSA VIN decoder API
 * @param vin Vehicle Identification Number
 * @returns Promise resolving to a Vehicle object
 */
export const fetchVehicleByVin = async (vin: string): Promise<Vehicle> => {
  try {
    console.log(`Fetching data for VIN: ${vin}`);
    
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
    
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year) {
      throw new Error("Unable to decode VIN or retrieve complete vehicle information");
    }
    
    console.log("Decoded vehicle data:", vehicleData);
    return vehicleData;
  } catch (error: any) {
    console.error("Error decoding VIN:", error);
    throw new Error(error.message || "Failed to decode VIN");
  }
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
    vin: getValueByVariable("VIN"), // Fix: Use getValueByVariable instead of direct access
    engine_details: {
      type: engineType || "",
      size: engineSize || "",
      fuel: fuelType || ""
    },
    body_style: bodyStyle || "",
    transmission: transmission || ""
  } as Vehicle;
};
