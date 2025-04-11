
import { supabase } from "@/integrations/supabase/client";
import { EnhancedSupabaseClient } from "./supabaseTypes";

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
 * Checks for existing profile first to avoid duplicate key errors
 * @param userId The UUID of the user to create a profile for
 * @param email The email address of the user
 * @param role The role to assign to the user
 */
export const createUserProfile = async (userId: string, email: string, role: "customer" | "garage") => {
  try {
    // Check if profile already exists to avoid duplicate errors
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingProfile) {
      console.log("Profile already exists for user:", userId);
      return; // Profile already exists, no need to create a new one
    }
    
    // Use direct insert instead of RPC function
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        role: role
      });
    
    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in createUserProfile:", error);
    throw error;
  }
};

/**
 * Checks if an email is a demo account
 * @param email The email address to check
 * @returns True if the email is a demo account
 */
export const isDemoAccount = (email: string): boolean => {
  return email === "demo-garage@bookmyparts.com";
};

/**
 * Handles authentication for demo accounts with special logic
 * Creates account if it doesn't exist and ensures profile is created
 * @returns Promise resolving to the demo user and role or null on error
 */
export const handleDemoAccount = async (): Promise<{ user: any, role: "garage" } | null> => {
  try {
    const demoEmail = "demo-garage@bookmyparts.com";
    const demoPassword = "demo-garage";
    
    // Try signing in first (if account exists)
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword
    });

    // If sign in is successful and we have a user
    if (!signInError && signInData.user) {
      console.log("Successfully signed in with demo account");
      
      // Ensure user has a profile
      try {
        const role = await fetchUserRole(signInData.user.id);
        if (!role) {
          console.log("Creating profile for existing demo user");
          await createUserProfile(signInData.user.id, demoEmail, "garage");
        }
      } catch (profileErr) {
        console.error("Error ensuring profile exists:", profileErr);
      }
      
      return { user: signInData.user, role: "garage" };
    }

    // If sign in fails because the account doesn't exist, try creating it
    if (signInError) {
      console.log("Creating demo account...");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: { role: 'garage' }
        }
      });

      if (signUpError) {
        console.error("Error creating demo account:", signUpError);
        return null;
      }

      if (signUpData.user) {
        try {
          await createUserProfile(signUpData.user.id, demoEmail, "garage");
          
          // Try signing in with the newly created account
          const { data: autoSignIn, error: autoSignInError } = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword
          });
          
          if (!autoSignInError && autoSignIn.user) {
            console.log("Successfully signed in with newly created demo account");
            return { user: autoSignIn.user, role: "garage" };
          }
        } catch (profileErr) {
          console.error("Error creating profile for new demo user:", profileErr);
        }
      }
    }
    
    // If account exists but needs email confirmation
    // For demo accounts, we'll use a direct approach to create a profile and bypass confirmation
    console.log("Trying alternative approach for demo account...");
    
    // Force create user profile if needed
    try {
      // This is a workaround for demo accounts
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await createUserProfile(userData.user.id, demoEmail, "garage");
        return { user: userData.user, role: "garage" };
      }
    } catch (error) {
      console.error("Final attempt for demo account failed:", error);
    }
    
    return null;
  } catch (error) {
    console.error("Demo account handling error:", error);
    return null;
  }
};
