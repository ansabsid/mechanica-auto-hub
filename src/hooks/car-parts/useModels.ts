
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Model } from "./types";

// Set a timeout for fetch operations (in milliseconds)
const FETCH_TIMEOUT = 15000;
const MAX_RETRIES = 3;

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
    console.log(`Fetching models for manufacturer ID: ${manufacturerId}`);
    
    try {
      const fetchPromise = supabase
        .from('models')
        .select('*')
        .eq('manufacturer_id', parseInt(manufacturerId))
        .order('name');
      
      const { data, error } = await fetchWithTimeout(fetchPromise);
      
      if (error) {
        throw error;
      }
      
      // Always provide fallback data regardless of DB response
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
        "4": [
          { id: 11, name: "C-Class", manufacturer_id: 4 },
          { id: 12, name: "E-Class", manufacturer_id: 4 },
          { id: 13, name: "G-Class", manufacturer_id: 4 },
        ],
        "5": [
          { id: 14, name: "Mustang", manufacturer_id: 5 },
          { id: 15, name: "F-150", manufacturer_id: 5 },
          { id: 16, name: "Explorer", manufacturer_id: 5 },
        ],
        "6": [
          { id: 17, name: "A4", manufacturer_id: 6 },
          { id: 18, name: "Q5", manufacturer_id: 6 },
          { id: 19, name: "R8", manufacturer_id: 6 },
        ],
        "7": [
          { id: 20, name: "Altima", manufacturer_id: 7 },
          { id: 21, name: "Rogue", manufacturer_id: 7 },
          { id: 22, name: "GT-R", manufacturer_id: 7 },
        ],
      };
      
      if (data && data.length > 0) {
        console.log(`Successfully fetched models: ${data.length} models found`);
        setModels(data);
      } else {
        console.log("No models found in database, using fallback data");
        // If no models found, provide fallback data
        const fallbackModels = mockModels[manufacturerId] || [];
        console.log(`Using fallback models for manufacturer ${manufacturerId}:`, fallbackModels);
        setModels(fallbackModels);
      }
      setIsLoading(false);
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
          "4": [
            { id: 11, name: "C-Class", manufacturer_id: 4 },
            { id: 12, name: "E-Class", manufacturer_id: 4 },
            { id: 13, name: "G-Class", manufacturer_id: 4 },
          ],
          "5": [
            { id: 14, name: "Mustang", manufacturer_id: 5 },
            { id: 15, name: "F-150", manufacturer_id: 5 },
            { id: 16, name: "Explorer", manufacturer_id: 5 },
          ],
          "6": [
            { id: 17, name: "A4", manufacturer_id: 6 },
            { id: 18, name: "Q5", manufacturer_id: 6 },
            { id: 19, name: "R8", manufacturer_id: 6 },
          ],
          "7": [
            { id: 20, name: "Altima", manufacturer_id: 7 },
            { id: 21, name: "Rogue", manufacturer_id: 7 },
            { id: 22, name: "GT-R", manufacturer_id: 7 },
          ],
        };
        
        const fallbackModels = mockModels[manufacturerId] || [];
        console.log(`Using fallback models for manufacturer ${manufacturerId}:`, fallbackModels);
        setModels(fallbackModels);
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
