
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

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

export const createUserProfile = async (userId: string, email: string, role: "customer" | "garage") => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        role: role
      });
    
    if (error) {
      console.error("Error creating profile:", error);
    }
  } catch (error) {
    console.error("Error in createUserProfile:", error);
  }
};
