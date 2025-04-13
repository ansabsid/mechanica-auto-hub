
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the current user session
 * @returns Promise resolving to the user session data
 */
export async function getUserSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting user session:", error);
      throw error;
    }
    
    console.log("User session data:", data.session?.user ? "Authenticated" : "Not authenticated");
    return data;
  } catch (error) {
    console.error("Error in getUserSession:", error);
    throw error;
  }
}
