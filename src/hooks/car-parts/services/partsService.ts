
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
  
  // Generate AND filter mock parts in one step - create only parts that match
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
  
  // Verify that all parts match the criteria
  const allMatch = mockParts.every(part => 
    part.manufacturer_id === manufacturerId && 
    part.model_id === modelId && 
    part.year === yearNum
  );
  
  console.log("⚠️ All mock parts match search criteria:", allMatch);
  
  return mockParts;
};
