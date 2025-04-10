
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Model } from "./types";

// Set a timeout for fetch operations (in milliseconds)
const FETCH_TIMEOUT = 5000;
const MAX_RETRIES = 2;

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch with timeout helper
  const fetchWithTimeout = async (promise) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Request timed out"));
      }, FETCH_TIMEOUT);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Fetch models for a manufacturer with retries
  const fetchModels = useCallback(async (manufacturerId: string, retryCount = 0) => {
    if (!manufacturerId) {
      setModels([]);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`Fetching models for manufacturer ID: ${manufacturerId}`);
      
      const fetchPromise = supabase
        .from('models')
        .select('*')
        .eq('manufacturer_id', parseInt(manufacturerId))
        .order('name');
      
      const { data, error } = await fetchWithTimeout(fetchPromise);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`Successfully fetched models: ${data.length} models found`);
        setModels(data);
      } else {
        console.log("No models found in database, using fallback data");
        // If no models found, provide fallback data
        const mockModels: { [key: string]: Model[] } = {
          "1": [
            { id: 1, name: "Corolla", manufacturer_id: 1 },
            { id: 2, name: "Camry", manufacturer_id: 1 },
            { id: 3, name: "RAV4", manufacturer_id: 1 },
            { id: 4, name: "Land Cruiser", manufacturer_id: 1 },
          ],
          "2": [
            { id: 5, name: "Civic", manufacturer_id: 2 },
            { id: 6, name: "Accord", manufacturer_id: 2 },
            { id: 7, name: "CR-V", manufacturer_id: 2 },
          ],
          "3": [
            { id: 8, name: "3 Series", manufacturer_id: 3 },
            { id: 9, name: "5 Series", manufacturer_id: 3 },
            { id: 10, name: "X5", manufacturer_id: 3 },
          ],
        };
        
        setModels(mockModels[manufacturerId] || []);
      }
    } catch (error: any) {
      console.error('Error fetching models:', error.message);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying fetch models (${retryCount + 1}/${MAX_RETRIES})...`);
        // Exponential backoff
        const backoffDelay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          fetchModels(manufacturerId, retryCount + 1);
        }, backoffDelay);
      } else {
        console.log("Max retries reached, using fallback data");
        // Fallback data on error
        const mockModels: { [key: string]: Model[] } = {
          "1": [
            { id: 1, name: "Corolla", manufacturer_id: 1 },
            { id: 2, name: "Camry", manufacturer_id: 1 },
            { id: 3, name: "RAV4", manufacturer_id: 1 },
            { id: 4, name: "Land Cruiser", manufacturer_id: 1 },
          ],
          "2": [
            { id: 5, name: "Civic", manufacturer_id: 2 },
            { id: 6, name: "Accord", manufacturer_id: 2 },
            { id: 7, name: "CR-V", manufacturer_id: 2 },
          ],
          "3": [
            { id: 8, name: "3 Series", manufacturer_id: 3 },
            { id: 9, name: "5 Series", manufacturer_id: 3 },
            { id: 10, name: "X5", manufacturer_id: 3 },
          ],
        };
        
        setModels(mockModels[manufacturerId] || []);
        setIsLoading(false);
      }
    } finally {
      // Only set loading to false if we're not retrying
      if (retryCount >= MAX_RETRIES) {
        setIsLoading(false);
      }
    }
  }, []);

  return {
    models,
    isLoading,
    fetchModels
  };
};
