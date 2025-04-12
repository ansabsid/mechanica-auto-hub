
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Part, Manufacturer, Model } from "./types";
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
    const { data, error } = await supabase.rpc('get_garages_for_part', {
      part_id_param: partId
    });

    if (error) {
      console.error("Error fetching garages for part", error);
      return [];
    }

    return data || [];
  };

  // Function to fetch garages for multiple parts
  const fetchGaragesForParts = async (partIds: number[]) => {
    if (!partIds || partIds.length === 0) return {};

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
      data.forEach(item => {
        if (!garagesMap[item.part_id]) {
          garagesMap[item.part_id] = [];
        }
        
        garagesMap[item.part_id].push({
          id: item.id,
          name: item.name,
          location: item.location,
          installationFee: parseFloat(item.installation_fee || 0)
        });
      });
    }

    console.log("Fetched garages map:", garagesMap);
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
        .select('*')
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
        
        // Fetch garages for all parts in one call
        const garagesMap = await fetchGaragesForParts(partIds);
        
        // Map garages to each part
        const partsWithGarages = data.map(part => ({
          ...part,
          garages: { 
            name: 'Mechanica Service Center',
            location: 'Dubai, UAE'
          },
          availableGarages: garagesMap[part.id] || []
        }));
        
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
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        // Get all part IDs to fetch garages in bulk
        const partIds = data.map(part => part.id);
        
        // Fetch garages for all parts in one call
        const garagesMap = await fetchGaragesForParts(partIds);
        
        // Map garages to each part
        const partsWithGarages = data.map(part => ({
          ...part,
          garages: { 
            name: 'Mechanica Service Center',
            location: 'Dubai, UAE'
          },
          availableGarages: garagesMap[part.id] || []
        }));
        
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
