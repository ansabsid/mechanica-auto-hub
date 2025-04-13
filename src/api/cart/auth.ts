
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
    } else {
      console.log("No authenticated user session found");
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUserSession:", error);
    throw error;
  }
}
