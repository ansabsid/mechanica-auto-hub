
import { Part, Manufacturer, Model } from "./types";

// Generate range of years (current year - 25)
export const generateYearRange = (): number[] => {
  return Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);
};

// Helper function to get consistent mock data
export const generateMockParts = (
  manufacturerId: number, 
  modelId: number, 
  year: number,
  manufacturers: Manufacturer[],
  models: Model[]
): Part[] => {
  // Get manufacturer and model names for better mock data
  const manufacturerName = manufacturers.find(m => m.id === manufacturerId)?.name || "Unknown";
  const modelName = models.find(m => m.id === modelId)?.name || "Unknown";
  
  return [
    {
      id: 1,
      name: `${manufacturerName} ${modelName} Brake Pads (${year})`,
      description: "Premium quality brake pads designed for optimal stopping power",
      price: 120,
      stock: 15,
      manufacturer_id: manufacturerId,
      model_id: modelId,
      year: year,
      garage_id: "1",
      garages: {
        name: "AutoCare Dubai",
        location: "Dubai Marina"
      }
    },
    {
      id: 2,
      name: `${manufacturerName} ${modelName} Oil Filter (${year})`,
      description: "High performance oil filter for extended engine life",
      price: 35,
      stock: 28,
      manufacturer_id: manufacturerId,
      model_id: modelId,
      year: year,
      garage_id: "2",
      garages: {
        name: "SparkTech Auto",
        location: "Al Quoz"
      }
    },
    {
      id: 3,
      name: `${manufacturerName} ${modelName} Air Filter (${year})`,
      description: "Premium air filter for improved performance and fuel efficiency",
      price: 45,
      stock: 12,
      manufacturer_id: manufacturerId,
      model_id: modelId,
      year: year,
      garage_id: "1",
      garages: {
        name: "AutoCare Dubai",
        location: "Dubai Marina"
      }
    },
    {
      id: 4,
      name: `${manufacturerName} ${modelName} Spark Plugs Set (${year})`,
      description: "Set of 4 high performance spark plugs",
      price: 60,
      stock: 20,
      manufacturer_id: manufacturerId,
      model_id: modelId,
      year: year,
      garage_id: "3",
      garages: {
        name: "Elite Auto Parts",
        location: "Jumeirah"
      }
    }
  ];
};
