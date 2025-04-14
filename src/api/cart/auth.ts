
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the current user session
 * @returns Promise resolving to the user session data
 */
export async function getUserSession() {
  try {
    console.log("Getting user session...");
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting user session:", error);
      throw error;
    }
    
    if (data.session?.user) {
      console.log("User session found:", data.session.user.id);
      console.log("User email:", data.session.user.email);
      console.log("User metadata:", data.session.user.user_metadata);
      
      // Log user role if present in metadata
      if (data.session.user.user_metadata?.role) {
        console.log("Role from user metadata:", data.session.user.user_metadata.role);
      }
      
      // Fetch user profile to confirm role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();
        
      if (!profileError && profileData) {
        console.log("Role from profile:", profileData.role);
      }
    } else {
      console.log("No authenticated user session found");
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUserSession:", error);
    throw error;
  }
}
