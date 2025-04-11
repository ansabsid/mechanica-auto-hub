
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

/**
 * CORS headers for cross-origin requests
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Mocked car parts database (temporary until we integrate with the real database)
 */
const mockParts = [
  {
    id: 1,
    name: "Brake Pads (Front)",
    description: "High-performance ceramic brake pads for improved stopping power",
    price: 120.50,
    stock: 15,
    manufacturer_id: 1,
    model_id: 1,
    year: 2022,
    garage_id: "1",
    garages: {
      name: "AutoCare Dubai",
      location: "Dubai Marina"
    },
    image_url: "https://images.unsplash.com/photo-1615384340342-28de71316d2a?w=800&h=600&auto=format"
  },
  {
    id: 2,
    name: "Oil Filter",
    description: "Premium oil filter for extended engine protection",
    price: 25.99,
    stock: 28,
    manufacturer_id: 1,
    model_id: 2, 
    year: 2021,
    garage_id: "2",
    garages: {
      name: "SparkTech Auto",
      location: "Al Quoz"
    },
    image_url: "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1?w=800&h=600&auto=format"
  },
  {
    id: 3,
    name: "Air Filter",
    description: "High-flow air filter for improved engine performance",
    price: 35.75,
    stock: 12,
    manufacturer_id: 2,
    model_id: 3,
    year: 2023,
    garage_id: "1",
    garages: {
      name: "AutoCare Dubai",
      location: "Dubai Marina"
    },
    image_url: "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1?w=800&h=600&auto=format"
  },
  {
    id: 4,
    name: "Spark Plugs Set",
    description: "Set of 4 iridium spark plugs for efficient combustion",
    price: 85.25,
    stock: 20,
    manufacturer_id: 3,
    model_id: 4,
    year: 2020,
    garage_id: "3",
    garages: {
      name: "Elite Auto Parts",
      location: "Jumeirah"
    },
    image_url: "https://images.unsplash.com/photo-1602079836063-583166fbeba2?w=800&h=600&auto=format"
  }
];

/**
 * Part labels we can recognize with our model
 */
const partLabels = [
  "brake pad",
  "brake disc",
  "oil filter",
  "air filter",
  "spark plug",
  "alternator",
  "battery",
  "radiator",
  "shock absorber",
  "fuel pump",
  "starter motor",
  "timing belt",
  "water pump",
  "transmission",
  "exhaust pipe"
];

/**
 * Main handler function for the edge function
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to scan car part");
    
    // For simplicity, we won't parse the image data since this is a mock implementation
    // Instead, we'll just return a random part from our mock database
    
    // Mock delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, you would:
    // 1. Use a Hugging Face model or another ML service to identify the part
    // 2. Query your database for matching parts
    
    // Recognize a part based on labels that might be in the image
    // For mock purposes, we'll select a specific part that would match what's in your database
    const partIndex = 2; // Air Filter (index 2 in the mockParts array)
    const recognizedPart = mockParts[partIndex];
    
    console.log(`Identified part: ${recognizedPart.name}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Part successfully identified",
        part: recognizedPart,
        confidence: 0.92, // Mock confidence score
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
    
  } catch (error) {
    console.error("Error in scan-car-part function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
