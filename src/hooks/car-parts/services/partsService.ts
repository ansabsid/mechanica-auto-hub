
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Manufacturer, Model, Part, Garage, GarageData } from "../types";

// Various functions for handling parts data

// Fetch manufacturers
export const fetchManufacturers = async (): Promise<Manufacturer[]> => {
  try {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error("Error fetching manufacturers:", error.message);
    toast.error("Failed to load manufacturers");
    return [];
  }
};

// Fetch models for a specific manufacturer
export const fetchModels = async (manufacturerId: number | string): Promise<Model[]> => {
  try {
    // Convert string to number if needed
    const numericManufacturerId = typeof manufacturerId === 'string' 
      ? parseInt(manufacturerId, 10) 
      : manufacturerId;
      
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('manufacturer_id', numericManufacturerId)
      .order('name');
      
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error("Error fetching models:", error.message);
    toast.error("Failed to load models");
    return [];
  }
};

// Generate a range of years (typically for car manufacturing years)
export const generateYearRange = (
  startYear: number = new Date().getFullYear() - 20,
  endYear: number = new Date().getFullYear()
): number[] => {
  const years: number[] = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
};

// Function to fetch garages for a part from the database
export const fetchGaragesForPart = async (partId: number): Promise<Garage[]> => {
  try {
    const { data, error } = await supabase.rpc('get_garages_for_part', {
      part_id_param: partId
    });

    if (error) {
      console.error("Error fetching garages for part:", error);
      return [];
    }

    // Transform result to match the Garage interface
    return (data || []).map(garage => ({
      id: garage.id,
      name: garage.name,
      location: garage.location,
      installationFee: typeof garage.installation_fee === 'string' 
        ? parseFloat(garage.installation_fee) 
        : Number(garage.installation_fee),
      area: ""  // Default empty string for area as it might not be returned by the function
    }));
  } catch (error) {
    console.error("Error in fetchGaragesForPart:", error);
    return [];
  }
};

// Function to mock search results for debugging or testing
export const mockSearchResults = async (
  manufacturerId: number,
  modelId: number,
  year: number
): Promise<Part[]> => {
  try {
    console.log("Mocking search for:", { manufacturerId, modelId, year });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data
    const mockParts: Part[] = [
      {
        id: 1,
        name: "Oil Filter",
        description: "High quality oil filter for optimal engine protection",
        price: 15.99,
        stock: 45,
        manufacturer_id: manufacturerId,
        model_id: modelId,
        year: year,
        garage_id: null,
        retailer_id: "3f0c6c4e-1c4d-4f5a-9c6e-8f7a9c0e1b2a",
        source_type: "retailer",
        garages: {
          name: "AutoCare Plus",
          location: "Dubai Marina"
        },
        image_url: "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1",
        availableGarages: [
          {
            id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
            name: "AutoCare Plus",
            location: "Dubai Marina",
            installationFee: 25,
            area: "Dubai Marina"
          },
          {
            id: "6p5o4n3m-2l1k-0j9i-8h7g-6f5e4d3c2b1a",
            name: "Premium Auto Garage",
            location: "Jumeirah",
            installationFee: 35,
            area: "Jumeirah"
          }
        ]
      },
      {
        id: 2,
        name: "Brake Pads (Front)",
        description: "Premium ceramic brake pads for quiet, effective braking",
        price: 45.99,
        stock: 22,
        manufacturer_id: manufacturerId,
        model_id: modelId,
        year: year,
        garage_id: null,
        retailer_id: "4e5f6g7h-8i9j-0k1l-2m3n-4o5p6q7r8s9t",
        source_type: "retailer",
        garages: {
          name: "Brake Specialists",
          location: "Al Quoz"
        },
        image_url: "https://images.unsplash.com/photo-1615384340342-28de71316d2a",
        availableGarages: [
          {
            id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
            name: "Brake Specialists",
            location: "Al Quoz",
            installationFee: 50,
            area: "Al Quoz"
          }
        ]
      },
      {
        id: 3,
        name: "Spark Plugs (Set of 4)",
        description: "Iridium spark plugs for improved fuel efficiency and performance",
        price: 32.50,
        stock: 15,
        manufacturer_id: manufacturerId,
        model_id: modelId,
        year: year,
        garage_id: null,
        retailer_id: "5g6h7i8j-9k0l-1m2n-3o4p-5q6r7s8t9u0v",
        source_type: "retailer",
        garages: {
          name: "Engine Experts",
          location: "Deira"
        },
        image_url: "https://images.unsplash.com/photo-1602079836063-583166fbeba2",
        availableGarages: [
          {
            id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
            name: "Engine Experts",
            location: "Deira",
            installationFee: 40,
            area: "Deira"
          },
          {
            id: "8r7q6p5o-4n3m-2l1k-0j9i-8h7g6f5e4d3c",
            name: "AutoCare Plus",
            location: "Dubai Marina",
            installationFee: 45,
            area: "Dubai Marina"
          }
        ]
      }
    ];
    
    return mockParts;
  } catch (error: any) {
    console.error("Error fetching mock search results:", error.message);
    toast.error("Failed to load parts data");
    return [];
  }
};

// Function to fetch parts by VIN (Vehicle Identification Number)
export const fetchPartsByVin = async (vin: string): Promise<Part[]> => {
  try {
    console.log("Fetching parts for VIN:", vin);
    
    // In a real implementation, this would call an API to decode the VIN
    // and then fetch parts that match the vehicle specifications
    
    // For now, we'll return mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data until VIN API is implemented
    const mockParts: Part[] = [
      {
        id: 101,
        name: "Oil Filter for " + vin.substring(0, 6),
        description: "Compatible with your vehicle's specs",
        price: 18.99,
        stock: 32,
        manufacturer_id: 1,
        model_id: 1,
        year: 2020,
        garage_id: null,
        retailer_id: "3f0c6c4e-1c4d-4f5a-9c6e-8f7a9c0e1b2a",
        source_type: "retailer",
        garages: {
          name: "AutoCare Plus",
          location: "Dubai Marina"
        },
        image_url: "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1",
        availableGarages: [
          {
            id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
            name: "AutoCare Plus",
            location: "Dubai Marina",
            installationFee: 25,
            area: "Dubai Marina"
          }
        ]
      },
      {
        id: 102,
        name: "Air Filter for " + vin.substring(0, 6),
        description: "High-flow air filter for your vehicle",
        price: 22.50,
        stock: 18,
        manufacturer_id: 1,
        model_id: 1,
        year: 2020,
        garage_id: null,
        retailer_id: "4e5f6g7h-8i9j-0k1l-2m3n-4o5p6q7r8s9t",
        source_type: "retailer",
        garages: {
          name: "AutoCare Plus",
          location: "Dubai Marina"
        },
        image_url: "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1",
        availableGarages: [
          {
            id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
            name: "AutoCare Plus",
            location: "Dubai Marina",
            installationFee: 20,
            area: "Dubai Marina"
          }
        ]
      }
    ];
    
    return mockParts;
  } catch (error: any) {
    console.error("Error fetching parts by VIN:", error.message);
    toast.error("Failed to fetch parts for this VIN");
    return [];
  }
};
