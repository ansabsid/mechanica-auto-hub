
import { supabase } from "@/integrations/supabase/client";

/**
 * A debugging utility to check if profile data exists and is correctly formatted
 */
export const checkUserProfile = async (userId: string) => {
  if (!userId) {
    console.log("[PROFILE DEBUG] No user ID provided for profile check");
    return null;
  }
  
  console.log("[PROFILE DEBUG] Checking profile for user ID:", userId);
  
  try {
    // Fetch the profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("[PROFILE DEBUG] Error fetching profile:", error);
      
      // Check for the specific cause of the error
      if (error.code === 'PGRST116') {
        console.log("[PROFILE DEBUG] IMPORTANT: No profile found for user. Profile creation might have failed!");
      }
      
      return null;
    }
    
    if (!profile) {
      console.log("[PROFILE DEBUG] No profile found for user ID:", userId);
      console.log("[PROFILE DEBUG] IMPORTANT: Profile creation might have failed for this user!");
      
      // Additional check in auth.users table to see if user exists but profile doesn't
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError) {
        console.error("[PROFILE DEBUG] Error checking user in auth.users:", userError);
      } else if (userData) {
        console.log("[PROFILE DEBUG] User exists in auth.users but no profile found!");
        console.log("[PROFILE DEBUG] User metadata:", userData.user.user_metadata);
      }
      
      return null;
    }
    
    console.log("[PROFILE DEBUG] Full profile data:", JSON.stringify(profile));
    
    // Check if name fields are populated
    if (!profile.firstName && !profile.lastName) {
      console.log("[PROFILE DEBUG] IMPORTANT: User profile exists but firstName and lastName are not set!");
    }
    
    // Check if role is set
    if (!profile.role) {
      console.log("[PROFILE DEBUG] IMPORTANT: User profile exists but role is not set!");
    }
    
    return profile;
  } catch (err) {
    console.error("[PROFILE DEBUG] Error in profile check:", err);
    return null;
  }
};

/**
 * Check for inconsistencies between user metadata and profile data
 */
export const checkUserMetadataConsistency = async (userId: string) => {
  try {
    // Get the user from Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) {
      console.error("Error getting user metadata:", userError);
      return;
    }
    
    if (!userData) {
      console.log("No user found with ID:", userId);
      return;
    }
    
    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error("Error getting profile for consistency check:", profileError);
      return;
    }
    
    const metadata = userData.user.user_metadata;
    
    // Compare role
    if (metadata.role !== profile.role) {
      console.log("Inconsistency detected: Role in metadata is", metadata.role, "but in profile is", profile.role);
    }
    
    // Compare name
    if (metadata.firstName !== profile.firstName || metadata.lastName !== profile.lastName) {
      console.log("Inconsistency detected: Name in metadata is", 
        `${metadata.firstName || ''} ${metadata.lastName || ''}`, 
        "but in profile is", 
        `${profile.firstName || ''} ${profile.lastName || ''}`);
    }
    
    // Compare phone
    if (metadata.fullPhone !== profile.phone) {
      console.log("Inconsistency detected: Phone in metadata is", metadata.fullPhone, "but in profile is", profile.phone);
    }
    
    console.log("Metadata consistency check completed.");
  } catch (err) {
    console.error("Error in metadata consistency check:", err);
  }
};
