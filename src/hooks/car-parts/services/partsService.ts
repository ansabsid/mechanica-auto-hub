
import { supabase } from "@/integrations/supabase/client";
import { Part, Manufacturer, Model } from "../types";
import { fetchWithTimeout } from "../utils/network";
import { generateMockParts } from "../utils";

/**
 * Fetches all parts from the database
 * @returns All parts with enhanced data
 */
export const fetchAllPartsFromDB = async () => {
  console.log("Fetching all available parts");
  
  try {
    // Define the return type for better type safety
    const response = await fetchWithTimeout<{data: any[], error: any}>(() => 
      supabase.from('parts').select('*')
    );
    
    if (response.error) {
      throw response.error;
    }
    
    console.log("All parts fetched from database:", response.data?.length || 0);
    
    // Process the parts data with garage information
    const processedParts: Part[] = (response.data || []).map(part => {
      return {
        ...part,
        garages: part.garage_id ? { 
          name: 'AutoCare Dubai',
          location: 'Dubai Marina'
        } : { 
          name: 'Mechanica Service Center',
          location: 'Dubai, UAE'
        }
      } as Part;
    });
    
    return processedParts;
  } catch (error) {
    console.error("Error in fetchAllPartsFromDB:", error);
    throw error;
  }
};

/**
 * Fetches parts for a specific vehicle from the database
 * @param manufacturerId The manufacturer ID
 * @param modelId The model ID 
 * @param year The year
 * @returns Filtered parts with enhanced data
 */
export const fetchPartsForVehicle = async (
  manufacturerId: number,
  modelId: number, 
  yearNum: number
) => {
  console.log(`Querying Supabase for parts: mfr=${manufacturerId}, model=${modelId}, year=${yearNum}`);
  
  try {
    // Define the return type for better type safety
    const response = await fetchWithTimeout<{data: any[], error: any}>(() => 
      supabase
        .from('parts')
        .select('*')
        .eq('manufacturer_id', manufacturerId)
        .eq('model_id', modelId)
        .eq('year', yearNum)
    );
    
    if (response.error) {
      throw response.error;
    }
    
    console.log("Supabase query result:", response.data);
    
    // Process and enhance the database results with default garage information
    const validParts: Part[] = (response.data || []).map(part => {
      return {
        ...part,
        garages: part.garage_id ? { 
          name: 'AutoCare Dubai',
          location: 'Dubai Marina'
        } : { 
          name: 'Mechanica Service Center',
          location: 'Dubai, UAE'
        }
      } as Part;
    });
    
    console.log("🔢 Valid parts from DB:", validParts.length);
    
    return validParts;
  } catch (error) {
    console.error("Error in fetchPartsForVehicle:", error);
    throw error;
  }
};

/**
 * Creates mock parts for a specific vehicle when database returns no results
 * @param manufacturerId The manufacturer ID 
 * @param modelId The model ID
 * @param year The year
 * @param manufacturers List of manufacturers for names
 * @param models List of models for names
 * @returns Mock parts for the vehicle
 */
export const createMockPartsForVehicle = (
  manufacturerId: number,
  modelId: number,
  yearNum: number,
  manufacturers: Manufacturer[],
  models: Model[]
) => {
  console.log("Generating mock parts for the specific vehicle...");
  
  // Special case for Toyota(1) Corolla(2) 2022 - only return air filter and brake pads
  if (manufacturerId === 1 && modelId === 2 && yearNum === 2022) {
    console.log("SPECIAL CASE: Toyota Corolla 2022 - returning only air filter and brake pads");
    
    return [
      {
        id: 101,
        name: "Air Filter - Toyota Corolla",
        description: "OEM compatible air filter for Toyota Corolla 2022",
        price: 29.99,
        stock: 15,
        manufacturer_id: 1, // Toyota
        model_id: 2, // Corolla
        year: 2022,
        garage_id: null,
        garages: {
          name: 'Mechanica Service Center',
          location: 'Dubai, UAE'
        }
      },
      {
        id: 102,
        name: "Brake Pads - Toyota Corolla",
        description: "Premium brake pads for Toyota Corolla 2022",
        price: 79.99,
        stock: 8,
        manufacturer_id: 1, // Toyota
        model_id: 2, // Corolla
        year: 2022,
        garage_id: null,
        garages: {
          name: 'Mechanica Service Center',
          location: 'Dubai, UAE'
        }
      }
    ];
  }
  
  // For all other vehicles, generate and filter mock parts
  const mockParts = generateMockParts(
    manufacturerId, 
    modelId, 
    yearNum,
    manufacturers,
    models
  ).filter(part => 
    part.manufacturer_id === manufacturerId && 
    part.model_id === modelId && 
    part.year === yearNum
  );
  
  console.log(`Generated ${mockParts.length} mock parts for vehicle: mfr=${manufacturerId}, model=${modelId}, year=${yearNum}`);
  
  return mockParts;
};
