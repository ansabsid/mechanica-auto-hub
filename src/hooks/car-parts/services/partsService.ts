
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
    
    // Get available garages for all parts
    const partIds = response.data?.map(part => part.id) || [];
    let availableGarages: Record<number, any[]> = {};
    
    if (partIds.length > 0) {
      const { data: garagesData, error: garagesError } = await supabase
        .rpc('get_garages_for_part_bulk', { part_ids: partIds });
      
      if (!garagesError && garagesData) {
        // Group garages by part_id
        garagesData.forEach(item => {
          if (!availableGarages[item.part_id]) {
            availableGarages[item.part_id] = [];
          }
          availableGarages[item.part_id].push({
            id: item.id,
            name: item.name,
            location: item.location,
            installationFee: item.installation_fee,
            area: item.location.split(',')[0].trim() // Extract area from location
          });
        });
      }
    }
    
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
        },
        availableGarages: availableGarages[part.id] || [
          {
            id: "g1",
            name: "Mechanica Service Center - Dubai Marina",
            location: "Dubai Marina, Dubai, UAE",
            installationFee: 25.99,
            area: "Dubai Marina"
          },
          {
            id: "g2",
            name: "Mechanica Service Center - Downtown",
            location: "Downtown Dubai, Dubai, UAE",
            installationFee: 29.99,
            area: "Downtown Dubai"
          },
          {
            id: "g3",
            name: "Mechanica Service Center - Jumeirah",
            location: "Jumeirah, Dubai, UAE",
            installationFee: 32.99,
            area: "Jumeirah"
          },
          {
            id: "g4",
            name: "Mechanica Service Center - Deira",
            location: "Deira, Dubai, UAE",
            installationFee: 27.99,
            area: "Deira"
          },
          {
            id: "g5",
            name: "AutoFix Express - Deira",
            location: "Al Rigga, Deira, Dubai, UAE",
            installationFee: 24.99,
            area: "Deira"
          },
          {
            id: "g6",
            name: "QuickFix Auto Workshop - Deira",
            location: "Al Muteena, Deira, Dubai, UAE",
            installationFee: 22.99,
            area: "Deira"
          },
          {
            id: "g7",
            name: "Dubai Auto Care - Deira",
            location: "Naif Road, Deira, Dubai, UAE",
            installationFee: 26.50,
            area: "Deira"
          },
          {
            id: "g8",
            name: "Speedy Auto Repair - Deira",
            location: "Port Saeed, Deira, Dubai, UAE",
            installationFee: 28.99,
            area: "Deira"
          },
          {
            id: "g9",
            name: "Al Muraqqabat Auto Center - Deira",
            location: "Al Muraqqabat, Deira, Dubai, UAE",
            installationFee: 23.50,
            area: "Deira"
          }
        ],
        image_url: part.image_url || getDefaultImageUrlForPart(part.name)
      } as Part;
    });
    
    return processedParts;
  } catch (error) {
    console.error("Error in fetchAllPartsFromDB:", error);
    throw error;
  }
};

// Helper function to get default image URL based on part name
function getDefaultImageUrlForPart(partName: string): string {
  const name = partName.toLowerCase();
  
  if (name.includes('oil')) {
    return "https://images.unsplash.com/photo-1635954749253-a0642359cdfa?w=800&h=600&auto=format";
  } else if (name.includes('filter')) {
    return "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1?w=800&h=600&auto=format";
  } else if (name.includes('brake')) {
    return "https://images.unsplash.com/photo-1615384340342-28de71316d2a?w=800&h=600&auto=format";
  } else if (name.includes('spark') || name.includes('ignition')) {
    return "https://images.unsplash.com/photo-1602079836063-583166fbeba2?w=800&h=600&auto=format";
  } else if (name.includes('tire') || name.includes('wheel')) {
    return "https://images.unsplash.com/photo-1591839728094-39242732d4c1?w=800&h=600&auto=format";
  } else if (name.includes('battery') || name.includes('electrical')) {
    return "https://images.unsplash.com/photo-1619641464045-b201ebd9ec0c?w=800&h=600&auto=format";
  } else if (name.includes('belt')) {
    return "https://images.unsplash.com/photo-1629584603667-e9eda1c06851?w=800&h=600&auto=format"; 
  } else {
    // Default auto parts image for other categories
    return "https://images.unsplash.com/photo-1647427060118-4911c9821b82?w=800&h=600&auto=format";
  }
}

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
    
    // Get available garages for all matched parts
    const partIds = response.data?.map(part => part.id) || [];
    let availableGarages: Record<number, any[]> = {};
    
    if (partIds.length > 0) {
      const { data: garagesData, error: garagesError } = await supabase
        .rpc('get_garages_for_part_bulk', { part_ids: partIds });
      
      if (!garagesError && garagesData) {
        // Group garages by part_id
        garagesData.forEach(item => {
          if (!availableGarages[item.part_id]) {
            availableGarages[item.part_id] = [];
          }
          availableGarages[item.part_id].push({
            id: item.id,
            name: item.name,
            location: item.location,
            installationFee: item.installation_fee,
            area: item.location.split(',')[0].trim() // Extract area from location
          });
        });
      }
    }
    
    // Process and enhance the database results with garage information
    const validParts: Part[] = (response.data || []).map(part => {
      return {
        ...part,
        garages: part.garage_id ? { 
          name: 'AutoCare Dubai',
          location: 'Dubai Marina'
        } : { 
          name: 'Mechanica Service Center',
          location: 'Dubai, UAE'
        },
        // Use real garages data from database if available
        availableGarages: availableGarages[part.id] || [],
        image_url: part.image_url || getDefaultImageUrlForPart(part.name)
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
): Part[] => {
  console.log("Generating mock parts for the specific vehicle...");
  
  // Special case for Toyota(1) Corolla(2) 2022
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
        },
        image_url: "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1?w=800&h=600&auto=format",
        availableGarages: [
          {
            id: "g1",
            name: "Mechanica Service Center - Dubai Marina",
            location: "Dubai Marina, Dubai, UAE",
            installationFee: 15.99,
            area: "Dubai Marina"
          },
          {
            id: "g2",
            name: "Mechanica Service Center - Downtown",
            location: "Downtown, Dubai, UAE",
            installationFee: 19.99,
            area: "Downtown Dubai"
          },
          {
            id: "g3",
            name: "Mechanica Service Center - Jumeirah",
            location: "Jumeirah, Dubai, UAE",
            installationFee: 17.99,
            area: "Jumeirah"
          },
          {
            id: "g4",
            name: "Mechanica Service Center - Deira",
            location: "Deira, Dubai, UAE",
            installationFee: 16.99,
            area: "Deira"
          },
          {
            id: "g5",
            name: "AutoFix Express - Deira",
            location: "Al Rigga, Deira, Dubai, UAE",
            installationFee: 14.99,
            area: "Deira"
          },
          {
            id: "g6",
            name: "QuickFix Auto Workshop - Deira",
            location: "Al Muteena, Deira, Dubai, UAE",
            installationFee: 13.99,
            area: "Deira"
          },
          {
            id: "g7",
            name: "Dubai Auto Care - Deira",
            location: "Naif Road, Deira, Dubai, UAE",
            installationFee: 15.50,
            area: "Deira"
          },
          {
            id: "g8",
            name: "Speedy Auto Repair - Deira",
            location: "Port Saeed, Deira, Dubai, UAE",
            installationFee: 17.99,
            area: "Deira"
          },
          {
            id: "g9",
            name: "Al Muraqqabat Auto Center - Deira",
            location: "Al Muraqqabat, Deira, Dubai, UAE",
            installationFee: 14.50,
            area: "Deira"
          }
        ]
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
        },
        image_url: "https://images.unsplash.com/photo-1615384340342-28de71316d2a?w=800&h=600&auto=format",
        availableGarages: [
          {
            id: "g1",
            name: "Mechanica Service Center - Dubai Marina",
            location: "Dubai Marina, Dubai, UAE",
            installationFee: 35.99,
            area: "Dubai Marina"
          },
          {
            id: "g3",
            name: "Mechanica Service Center - Jumeirah",
            location: "Jumeirah, Dubai, UAE",
            installationFee: 39.99,
            area: "Jumeirah"
          },
          {
            id: "g4",
            name: "Mechanica Service Center - Deira",
            location: "Deira, Dubai, UAE",
            installationFee: 32.99,
            area: "Deira"
          },
          {
            id: "g5",
            name: "AutoFix Express - Deira",
            location: "Al Rigga, Deira, Dubai, UAE",
            installationFee: 34.99,
            area: "Deira"
          },
          {
            id: "g7",
            name: "Dubai Auto Care - Deira",
            location: "Naif Road, Deira, Dubai, UAE",
            installationFee: 36.50,
            area: "Deira"
          },
          {
            id: "g8",
            name: "Speedy Auto Repair - Deira",
            location: "Port Saeed, Deira, Dubai, UAE",
            installationFee: 38.99,
            area: "Deira"
          },
          {
            id: "g9",
            name: "Al Muraqqabat Auto Center - Deira",
            location: "Al Muraqqabat, Deira, Dubai, UAE",
            installationFee: 33.50,
            area: "Deira"
          }
        ]
      }
    ];
  }
  
  // Special case for Toyota(1) Corolla(2) 2023
  if (manufacturerId === 1 && modelId === 2 && yearNum === 2023) {
    console.log("SPECIAL CASE: Toyota Corolla 2023 - returning only air filter and brake pads");
    
    return [
      {
        id: 201,
        name: "Air Filter - Toyota Corolla",
        description: "OEM compatible air filter for Toyota Corolla 2023",
        price: 32.99,
        stock: 20,
        manufacturer_id: 1, // Toyota
        model_id: 2, // Corolla
        year: 2023,
        garage_id: null,
        garages: {
          name: 'Mechanica Service Center',
          location: 'Dubai, UAE'
        },
        image_url: "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1?w=800&h=600&auto=format",
        availableGarages: [
          {
            id: "g1",
            name: "Mechanica Service Center - Dubai Marina",
            location: "Dubai Marina, Dubai, UAE",
            installationFee: 15.99,
            area: "Dubai Marina"
          },
          {
            id: "g2",
            name: "Mechanica Service Center - Downtown",
            location: "Downtown, Dubai, UAE",
            installationFee: 19.99,
            area: "Downtown Dubai"
          },
          {
            id: "g4",
            name: "Mechanica Service Center - Deira",
            location: "Deira, Dubai, UAE",
            installationFee: 18.99,
            area: "Deira"
          },
          {
            id: "g5",
            name: "AutoFix Express - Deira",
            location: "Al Rigga, Deira, Dubai, UAE",
            installationFee: 17.99,
            area: "Deira"
          },
          {
            id: "g6",
            name: "QuickFix Auto Workshop - Deira",
            location: "Al Muteena, Deira, Dubai, UAE",
            installationFee: 16.99,
            area: "Deira"
          },
          {
            id: "g8",
            name: "Speedy Auto Repair - Deira",
            location: "Port Saeed, Deira, Dubai, UAE",
            installationFee: 18.99,
            area: "Deira"
          },
          {
            id: "g9",
            name: "Al Muraqqabat Auto Center - Deira",
            location: "Al Muraqqabat, Deira, Dubai, UAE",
            installationFee: 15.50,
            area: "Deira"
          }
        ]
      },
      {
        id: 202,
        name: "Brake Pads - Toyota Corolla",
        description: "Premium brake pads for Toyota Corolla 2023",
        price: 84.99,
        stock: 12,
        manufacturer_id: 1, // Toyota
        model_id: 2, // Corolla
        year: 2023,
        garage_id: null,
        garages: {
          name: 'Mechanica Service Center',
          location: 'Dubai, UAE'
        },
        image_url: "https://images.unsplash.com/photo-1615384340342-28de71316d2a?w=800&h=600&auto=format",
        availableGarages: [
          {
            id: "g1",
            name: "Mechanica Service Center - Dubai Marina",
            location: "Dubai Marina, Dubai, UAE",
            installationFee: 35.99,
            area: "Dubai Marina"
          },
          {
            id: "g3",
            name: "Mechanica Service Center - Jumeirah",
            location: "Jumeirah, Dubai, UAE",
            installationFee: 39.99,
            area: "Jumeirah"
          },
          {
            id: "g4",
            name: "Mechanica Service Center - Deira",
            location: "Deira, Dubai, UAE",
            installationFee: 36.99,
            area: "Deira"
          },
          {
            id: "g6",
            name: "QuickFix Auto Workshop - Deira",
            location: "Al Muteena, Deira, Dubai, UAE",
            installationFee: 34.99,
            area: "Deira"
          },
          {
            id: "g7",
            name: "Dubai Auto Care - Deira",
            location: "Naif Road, Deira, Dubai, UAE",
            installationFee: 37.50,
            area: "Deira"
          },
          {
            id: "g8",
            name: "Speedy Auto Repair - Deira",
            location: "Port Saeed, Deira, Dubai, UAE",
            installationFee: 39.99,
            area: "Deira"
          },
          {
            id: "g9",
            name: "Al Muraqqabat Auto Center - Deira",
            location: "Al Muraqqabat, Deira, Dubai, UAE",
            installationFee: 35.50,
            area: "Deira"
          }
        ]
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

  // Add availableGarages to mock parts and ensure image_url is present
  return mockParts.map(part => ({
    ...part,
    image_url: part.image_url || getDefaultImageUrlForPart(part.name),
    availableGarages: [
      {
        id: "g1",
        name: "Mechanica Service Center - Dubai Marina",
        location: "Dubai Marina, Dubai, UAE",
        installationFee: 25.99,
        area: "Dubai Marina"
      },
      {
        id: "g2",
        name: "Mechanica Service Center - Downtown",
        location: "Downtown, Dubai, UAE",
        installationFee: 29.99,
        area: "Downtown Dubai"
      },
      {
        id: "g3",
        name: "Mechanica Service Center - Jumeirah",
        location: "Jumeirah, Dubai, UAE",
        installationFee: 32.99,
        area: "Jumeirah"
      },
      {
        id: "g4",
        name: "Mechanica Service Center - Deira",
        location: "Deira, Dubai, UAE",
        installationFee: 27.99,
        area: "Deira"
      },
      {
        id: "g5",
        name: "AutoFix Express - Deira",
        location: "Al Rigga, Deira, Dubai, UAE",
        installationFee: 24.99,
        area: "Deira"
      },
      {
        id: "g6",
        name: "QuickFix Auto Workshop - Deira",
        location: "Al Muteena, Deira, Dubai, UAE",
        installationFee: 22.99,
        area: "Deira"
      },
      {
        id: "g7",
        name: "Dubai Auto Care - Deira",
        location: "Naif Road, Deira, Dubai, UAE",
        installationFee: 26.50,
        area: "Deira"
      },
      {
        id: "g8",
        name: "Speedy Auto Repair - Deira",
        location: "Port Saeed, Deira, Dubai, UAE",
        installationFee: 28.99,
        area: "Deira"
      },
      {
        id: "g9",
        name: "Al Muraqqabat Auto Center - Deira",
        location: "Al Muraqqabat, Deira, Dubai, UAE",
        installationFee: 23.50,
        area: "Deira"
      }
    ]
  }));
};
