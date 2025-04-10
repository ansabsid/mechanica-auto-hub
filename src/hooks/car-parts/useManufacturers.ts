
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Manufacturer } from "./types";

// Increase timeout for fetch operations (in milliseconds)
const FETCH_TIMEOUT = 15000; // Increase from 10000 to 15000 ms (15 seconds)
const MAX_RETRIES = 3;  // Increase max retries

export const useManufacturers = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Add a ref to track if we've already attempted to fetch
  const fetchAttemptedRef = useRef<boolean>(false);

  // Fetch with timeout helper with improved retries
  const fetchWithTimeout = async (promise, retryCount = 0) => {
    let timeoutId;
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Request timed out"));
        }, FETCH_TIMEOUT);
      });

      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // If we still have retries left, try again after a delay
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying timeout fetch (${retryCount + 1}/${MAX_RETRIES})...`);
        const backoffDelay = Math.pow(2, retryCount) * 1000;
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return fetchWithTimeout(promise, retryCount + 1);
      }
      
      throw error;
    }
  };

  // Fetch manufacturers with retries
  const fetchManufacturers = useCallback(async (retryCount = 0) => {
    // If manufacturers already loaded, don't fetch again
    if (manufacturers.length > 0) {
      console.log("Manufacturers already loaded, skipping fetch");
      return;
    }
    
    // Only set loading to true on the first attempt
    if (retryCount === 0) {
      setIsLoading(true);
    }
    
    try {
      console.log("Fetching manufacturers from Supabase...");
      
      const fetchPromise = supabase
        .from('manufacturers')
        .select('*')
        .order('name');
      
      const { data, error } = await fetchWithTimeout(fetchPromise);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Successfully fetched manufacturers:", data.length);
        setManufacturers(data);
      } else {
        console.log("No manufacturers found, using fallback data");
        // Show fallback data if no results
        setManufacturers([
          { id: 1, name: "Toyota" },
          { id: 2, name: "Honda" },
          { id: 3, name: "BMW" },
          { id: 4, name: "Mercedes" },
          { id: 5, name: "Ford" },
          { id: 6, name: "Audi" },
          { id: 7, name: "Nissan" },
        ]);
      }
      
      // Always set loading to false after a successful fetch
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching manufacturers:', error.message);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying fetch manufacturers (${retryCount + 1}/${MAX_RETRIES})...`);
        // Exponential backoff
        const backoffDelay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          fetchManufacturers(retryCount + 1);
        }, backoffDelay);
      } else {
        console.log("Max retries reached, using fallback data");
        // Show fallback data if error
        setManufacturers([
          { id: 1, name: "Toyota" },
          { id: 2, name: "Honda" },
          { id: 3, name: "BMW" },
          { id: 4, name: "Mercedes" },
          { id: 5, name: "Ford" },
          { id: 6, name: "Audi" },
          { id: 7, name: "Nissan" },
        ]);
        setIsLoading(false);
      }
    }
  }, [manufacturers.length]);

  // Auto-fetch manufacturers on mount, but only once
  useEffect(() => {
    if (!fetchAttemptedRef.current) {
      fetchAttemptedRef.current = true;
      fetchManufacturers();
    }
  }, [fetchManufacturers]);

  return {
    manufacturers,
    isLoading,
    fetchManufacturers
  };
};
