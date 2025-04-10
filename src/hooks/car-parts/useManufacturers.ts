
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Manufacturer } from "./types";

// Set a timeout for fetch operations (in milliseconds)
const FETCH_TIMEOUT = 5000;
const MAX_RETRIES = 2;

export const useManufacturers = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Add a ref to track if we've already attempted to fetch
  const fetchAttemptedRef = useRef<boolean>(false);

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

  // Fetch manufacturers with retries
  const fetchManufacturers = useCallback(async (retryCount = 0) => {
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
  }, []);

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
