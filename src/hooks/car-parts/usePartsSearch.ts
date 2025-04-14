
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Part, Manufacturer, Model, GarageData } from "./types";
import { toast } from "sonner";

export const usePartsSearch = (
  manufacturers: Manufacturer[],
  models: Model[]
) => {
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [queryTime, setQueryTime] = useState<number | null>(null);

  // Function to fetch garages for a specific part
  const fetchGaragesForPart = async (partId: number) => {
    console.log("Fetching garages for part ID:", partId);
    
    const { data, error } = await supabase.rpc('get_garages_for_part', {
      part_id_param: partId
    });

    if (error) {
      console.error("Error fetching garages for part", error);
      return [];
    }

    console.log("Received garage data for part:", data);
    return data || [];
  };

  // Function to fetch garages for multiple parts
  const fetchGaragesForParts = async (partIds: number[]) => {
    if (!partIds || partIds.length === 0) return {};

    console.log("Fetching garages for part IDs:", partIds);
    
    // Use a fresh query to get the latest installation fees from the database
    const { data, error } = await supabase.rpc('get_garages_for_part_bulk', {
      part_ids: partIds
    });

    if (error) {
      console.error("Error fetching garages for parts", error);
      return {};
    }

    // Create a map of part_id to garages
    const garagesMap: Record<number, any[]> = {};
    
    if (data && Array.isArray(data)) {
      console.log("Raw garage data received:", data);
      
      data.forEach(item => {
        if (!garagesMap[item.part_id]) {
          garagesMap[item.part_id] = [];
        }
        
        // Ensure all values are properly converted to the right types
        // The installation_fee can come as a string or number from the database
        // Force conversion to a number to ensure consistency
        const rawFee = item.installation_fee !== null ? item.installation_fee : 0;
        const installationFee = typeof rawFee === 'string' ? parseFloat(rawFee) : Number(rawFee);
        
        console.log(`For part ${item.part_id}, garage ${item.id}: installation fee raw=${rawFee}, type=${typeof rawFee}, converted=${installationFee}`);
        
        garagesMap[item.part_id].push({
          id: item.id, // This is a UUID string, no conversion needed
          name: item.name,
          location: item.location,
          installationFee: installationFee,
          area: item.area || ""
        });
      });
    }

    console.log("Processed garages map:", garagesMap);
    return garagesMap;
  };

  // Function to reset search results
  const resetSearch = useCallback(() => {
    setParts([]);
    setSearchCompleted(false);
    setQueryTime(null);
  }, []);

  // Function to search for parts based on manufacturer, model, and year
  const searchParts = useCallback(async (
    manufacturerId: number,
    modelId: number,
    year: number
  ) => {
    setIsSearching(true);
    setIsLoading(true);
    setSearchCompleted(false);
    setParts([]);

    try {
      console.log("Searching parts with:", { manufacturerId, modelId, year });
      
      const startTime = performance.now();
      
      // Query parts table for matching parts
      const { data, error } = await supabase
        .from('parts')
        .select('*, retailers(name)')
        .eq('manufacturer_id', manufacturerId)
        .eq('model_id', modelId)
        .eq('year', year);

      if (error) {
        throw error;
      }

      const endTime = performance.now();
      const queryDuration = endTime - startTime;
      setQueryTime(queryDuration);
      console.log(`Query completed in ${queryDuration.toFixed(2)}ms, found ${data?.length || 0} parts`);

      if (data && data.length > 0) {
        // Get all part IDs to fetch garages in bulk
        const partIds = data.map(part => part.id);
        
        // Fetch garages for all parts in one call - this will get fresh installation fees from parts_garages table
        const garagesMap = await fetchGaragesForParts(partIds);
        
        // Log all fetched installation fees for debugging
        console.log("All fetched installation fees:", garagesMap);
        
        // Map garages to each part
        const partsWithGarages = data.map(part => {
          const availableGarages = garagesMap[part.id] || [];
          console.log(`Processing part ${part.id} with ${availableGarages.length} garages`);
          
          // Log installation fees for this part
          if (availableGarages.length > 0) {
            availableGarages.forEach(garage => {
              console.log(`Part ${part.id}, Garage ${garage.id}: Installation Fee = ${garage.installationFee}`);
            });
          } else {
            console.log(`Part ${part.id}: No garages available`);
          }
          
          // Create a proper Part object with garages information
          return {
            ...part,
            source_type: part.garage_id ? 'garage' : 'retailer',
            retailer_id: part.retailer_id || null,
            garages: { 
              name: 'Mechanica Service Center',
              location: 'Dubai, UAE'
            },
            availableGarages: availableGarages
          } as Part;
        });
        
        console.log("Parts with garages:", partsWithGarages);
        setParts(partsWithGarages);
      } else {
        setParts([]);
      }
    } catch (error: any) {
      console.error("Error searching parts:", error.message);
      toast.error("Failed to search for parts. Please try again.");
      setParts([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      setSearchCompleted(true);
    }
  }, []);

  // Function to fetch all parts (used for admin or diagnostic purposes)
  const fetchAllParts = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*, retailers(name)')
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        // Get all part IDs to fetch garages in bulk
        const partIds = data.map(part => part.id);
        
        // Fetch garages for all parts in one call - this gets fresh installation fees
        const garagesMap = await fetchGaragesForParts(partIds);
        
        // Map garages to each part
        const partsWithGarages = data.map(part => {
          const availableGarages = garagesMap[part.id] || [];
          
          // Create a proper Part object with garages information
          return {
            ...part,
            source_type: part.garage_id ? 'garage' : 'retailer',
            retailer_id: part.retailer_id || null,
            garages: { 
              name: 'Mechanica Service Center',
              location: 'Dubai, UAE'
            },
            availableGarages: availableGarages
          } as Part;
        });
        
        console.log("All parts with fresh garage data:", partsWithGarages);
        setAllParts(partsWithGarages);
        return partsWithGarages;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching all parts:", error.message);
      toast.error("Failed to fetch parts.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    allParts,
    parts,
    isLoading,
    isSearching,
    searchCompleted,
    queryTime,
    searchParts,
    resetSearch,
    fetchAllParts,
    fetchGaragesForPart
  };
};

export default usePartsSearch;
