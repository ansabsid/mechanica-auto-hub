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
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (data && !error) {
      return data.role as "customer" | "garage";
    } else if (error) {
      console.error("Error fetching user profile:", error.message);
    }
  } catch (err) {
    console.error("Error in fetchUserRole:", err);
  }
  
  return null;
};

/**
 * Creates a profile for a user with a specific role
 * @param userId The UUID of the user to create a profile for
 * @param email The email address of the user
 * @param role The role to assign to the user
 * @param metadata Additional metadata for the user profile
 */
export const createUserProfile = async (
  userId: string, 
  email: string, 
  role: "customer" | "garage", 
  metadata: UserMetadata = {}
) => {
  try {
    console.log("Creating user profile with metadata:", metadata);
    
    // Check if profile already exists to avoid duplicate errors
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingProfile) {
      console.log("Profile already exists for user:", userId);
      
      // Update the existing profile with new metadata
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          firstName: metadata?.firstName || null,
          lastName: metadata?.lastName || null,
          phone: metadata?.fullPhone || null,
          role: role
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Error updating existing profile:", updateError);
      }
      
      return; // Profile already exists and was updated
    }
    
    // Create profile data object with basic info
    const profileData: any = {
      id: userId,
      email: email,
      role: role,
      phone: metadata?.fullPhone || (metadata?.countryCode && metadata?.phoneNumber ? `${metadata.countryCode}${metadata.phoneNumber}` : null),
      firstName: metadata?.firstName || null,
      lastName: metadata?.lastName || null,
    };
    
    console.log("Creating profile with data:", profileData);
    
    // Add garage-specific data if role is garage
    if (role === "garage" && metadata) {
      profileData.garage_name = metadata.garageName;
      profileData.garage_location = metadata.garageLocation;
      profileData.garage_registration_number = metadata.garageRegistrationNumber;
    }
    
    // Insert the profile data
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profileData);
      
    if (insertError) {
      console.error("Error inserting profile:", insertError);
      
      // If RPC function exists, try using it as a fallback
      try {
        const { error: rpcError } = await enhancedSupabase.rpc('create_profile_for_user', {
          user_id: userId,
          user_email: email,
          user_role: role
        });
        
        if (rpcError) {
          console.error("RPC fallback failed:", rpcError);
        } else {
          console.log("Profile created using RPC function");
        }
      } catch (rpcErr) {
        console.error("Error calling RPC function:", rpcErr);
      }
    } else {
      console.log("Profile successfully created for user:", userId);
    }
  } catch (err) {
    console.error("Error in createUserProfile:", err);
  }
};

// Function to check if the email is one of our demo accounts
export const isDemoAccount = (email: string): boolean => {
  const demoEmails = [
    "demo@bookmyparts.com",
    "garage-masters@bookmyparts.com", 
    "workshop-experts@bookmyparts.com",
    "bmw-specialist@bookmyparts.com",
    "customer@bookmyparts.com"
  ];
  
  return demoEmails.includes(email.toLowerCase());
};

// Handle special login flow for demo accounts
export const handleDemoAccount = async (email: string): Promise<{ user: unknown; role: "customer" | "garage" } | null> => {
  try {
    console.log(`Handling demo account: ${email}`);
    
    // Determine the role based on the demo email
    const isGarage = email.includes("garage") || email.includes("workshop") || email.includes("specialist");
    const role: "customer" | "garage" = isGarage ? "garage" : "customer";
    
    // Sign in with magic link (this will create the account if it doesn't exist)
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });
    
    if (error) {
      console.error("Error in demo account flow:", error);
      return null;
    }
    
    // For demo accounts, we'll create a profile with appropriate data
    // This is typically done by a trigger in production
    if (data) {
      console.log("Demo account signed in successfully, setting up profile");
      
      return {
        user: { email },
        role
      };
    }
    
    return null;
  } catch (err) {
    console.error("Error in handleDemoAccount:", err);
    return null;
  }
};
