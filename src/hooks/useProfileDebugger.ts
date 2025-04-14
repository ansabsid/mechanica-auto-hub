
import { supabase } from "@/integrations/supabase/client";

/**
 * A debugging utility to check if profile data exists and is correctly formatted
 */
export const checkUserProfile = async (userId: string) => {
  if (!userId) {
    console.log("No user ID provided for profile check");
    return null;
  }
  
  console.log("Checking profile for user ID:", userId);
  
  try {
    // Fetch the profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    if (!profile) {
      console.log("No profile found for user ID:", userId);
      return null;
    }
    
    console.log("Profile data for user:", profile);
    
    // Check if name fields are populated
    if (!profile.firstName && !profile.lastName) {
      console.log("IMPORTANT: User profile exists but firstName and lastName are not set!");
    }
    
    return profile;
  } catch (err) {
    console.error("Error in profile check:", err);
    return null;
  }
};
