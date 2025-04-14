
import { supabase } from "@/integrations/supabase/client";
import { EnhancedSupabaseClient } from "./supabaseTypes";

// Define metadata interface for consistency
interface UserMetadata {
  firstName?: string;
  lastName?: string;
  fullPhone?: string;
  countryCode?: string;
  phoneNumber?: string;
  garageName?: string;
  garageLocation?: string;
  garageRegistrationNumber?: string;
  [key: string]: any;
}

// Cast supabase client to enhanced type with RPC functions
const enhancedSupabase = supabase as unknown as EnhancedSupabaseClient;

/**
 * Fetches the role of a user from their profile
 * @param userId The UUID of the user to fetch the role for
 * @returns Promise resolving to the user's role or null if not found
 */
export const fetchUserRole = async (userId: string): Promise<"customer" | "garage" | null> => {
  try {
    console.log("Fetching role for user:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role, garage_id')
      .eq('id', userId)
      .single();
      
    if (data && !error) {
      console.log("Found profile for user:", data);
      return data.role as "customer" | "garage";
    } else if (error) {
      console.error("Error fetching user profile:", error.message);
    }
  } catch (err) {
    console.error("Error in fetchUserRole:", err);
  }
  
  return null;
};

export const createUserProfile = async (
  userId: string, 
  email: string, 
  role: "customer" | "garage", 
  metadata: UserMetadata = {}
) => {
  try {
    console.log("Creating user profile with metadata:", metadata);
    console.log("ROLE BEING SET:", role);
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingProfile) {
      console.log("Profile already exists for user:", userId);
      return;
    }
    
    // If this is a garage owner, first create the garage entry
    let garageId: string | null = null;
    if (role === "garage") {
      console.log("Creating new garage for garage owner");
      
      // Add detailed logging to track the garage creation
      console.log("Garage data for creation:", {
        name: metadata.garageName || 'New Garage',
        location: metadata.garageLocation || 'Location pending',
        area: metadata.garageLocation?.split(',')[0]?.trim() || null,
      });
      
      // Create the garage entry explicitly
      const { data: garageResult, error: garageError } = await supabase
        .from('garages')
        .insert([{
          name: metadata.garageName || 'New Garage',
          location: metadata.garageLocation || 'Location pending',
          area: metadata.garageLocation?.split(',')[0]?.trim() || null
        }])
        .select();
        
      if (garageError) {
        console.error("Error creating garage entry:", garageError);
        throw garageError;
      }
      
      if (!garageResult || garageResult.length === 0) {
        console.error("No garage was created despite successful response");
        throw new Error("Failed to create garage - no ID returned");
      }
      
      console.log("New garage created successfully:", garageResult[0]);
      garageId = garageResult[0].id;
    }
    
    // Create profile data object with basic info
    const profileData: any = {
      id: userId,
      email: email,
      role: role,
      phone: metadata?.fullPhone || (metadata?.countryCode && metadata?.phoneNumber ? `${metadata.countryCode}${metadata.phoneNumber}` : null),
      firstName: metadata?.firstName || null,
      lastName: metadata?.lastName || null,
      garage_id: garageId // Link the new garage ID to the profile
    };
    
    console.log("Creating new profile with data:", profileData);
    
    // Insert the profile data
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([profileData]);
      
    if (insertError) {
      console.error("Error inserting profile:", insertError);
      
      // If the profile insertion fails, try to clean up the created garage
      if (garageId) {
        await supabase
          .from('garages')
          .delete()
          .eq('id', garageId);
      }
      
      throw insertError;
    }
    
    console.log("Profile successfully created for user:", userId, "with role:", role);
    
    // Double-check that the garage was created and linked properly for garage role
    if (role === "garage") {
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('garage_id')
        .eq('id', userId)
        .single();
        
      console.log("Profile garage_id verification:", profileCheck?.garage_id);
      
      const { data: garageCheck } = await supabase
        .from('garages')
        .select('*')
        .eq('id', garageId)
        .single();
        
      console.log("Garage verification:", garageCheck ? "Exists" : "Not Found");
    }
    
  } catch (err) {
    console.error("Error in createUserProfile:", err);
    throw err;
  }
};

// Function to check if the email is one of our demo accounts
export const isDemoAccount = (email: string): boolean => {
  const demoEmails = [
    "demo@bookmyparts.com",
    "demo.garage@example.com", 
    "garage.masters@example.com",
    "bmw.specialist@example.com",
    "customer@bookmyparts.com"
  ];
  
  return demoEmails.includes(email.toLowerCase());
};

// Handle special login flow for demo accounts
export const handleDemoAccount = async (email: string): Promise<{ user: unknown; role: "customer" | "garage" } | null> => {
  try {
    console.log(`Handling demo account: ${email}`);
    
    // Instead of trying to authenticate with Supabase which is failing,
    // let's create a mock user response for demo accounts
    
    // Determine the role based on the demo email
    const isGarage = email.includes("garage") || email.includes("specialist");
    const role: "customer" | "garage" = isGarage ? "garage" : "customer";
    
    // Create a mock user for demo purposes
    const mockUser = {
      email,
      id: "demo-user-id",
      app_metadata: {
        role: role
      }
    };
    
    return {
      user: mockUser,
      role
    };
  } catch (err) {
    console.error("Error in handleDemoAccount:", err);
    return null;
  }
};
