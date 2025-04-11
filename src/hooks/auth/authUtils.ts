
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const fetchUserRole = async (userId: string): Promise<"customer" | "garage" | "admin" | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (data && !error) {
      return data.role as "customer" | "garage" | "admin";
    } else if (error) {
      console.error("Error fetching user profile:", error.message);
    }
  } catch (err) {
    console.error("Error in fetchUserRole:", err);
  }
  
  return null;
};

export const createUserProfile = async (userId: string, email: string, role: "customer" | "garage" | "admin") => {
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

// Special function to check if user is admin
export const isAdminUser = (email: string): boolean => {
  // Add your email here to grant admin access to the garage login tab
  const adminEmails = [
    "admin@example.com", 
    "your.email@example.com",
    "demo@garage.com",
    "test@example.com",
    "admin@test.com"
  ]; // Added demo emails
  return adminEmails.includes(email.toLowerCase());
};
