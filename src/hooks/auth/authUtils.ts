
import { supabase } from "@/integrations/supabase/client";
import { EnhancedSupabaseClient } from "./supabaseTypes";

// Cast supabase client to enhanced type with RPC functions
const enhancedSupabase = supabase as unknown as EnhancedSupabaseClient;

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
    
    // Use serviceRole client for admin operations that bypass RLS
    const { error } = await enhancedSupabase.rpc('create_profile_for_user', {
      user_id: userId,
      user_email: email,
      user_role: role
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

export const isDemoAccount = (email: string): boolean => {
  return email === "demo@mechanica.com";
};

export const handleDemoAccount = async (): Promise<{ user: any, role: "garage" } | null> => {
  try {
    const demoEmail = "demo@mechanica.com";
    const demoPassword = "garage123";
    
    // Try signing in first (if account exists)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword
    });

    if (!signInError && signInData.user) {
      console.log("Successfully signed in with demo account");
      
      // Ensure user has a profile
      try {
        const role = await fetchUserRole(signInData.user.id);
        if (!role) {
          console.log("Creating profile for existing demo user");
          await enhancedSupabase.rpc('create_profile_for_user', {
            user_id: signInData.user.id,
            user_email: demoEmail,
            user_role: 'garage'
          });
        }
      } catch (profileErr) {
        console.error("Error ensuring profile exists:", profileErr);
      }
      
      return { user: signInData.user, role: "garage" };
    }

    // If sign in fails, create a demo account
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
        await enhancedSupabase.rpc('create_profile_for_user', {
          user_id: signUpData.user.id,
          user_email: demoEmail,
          user_role: 'garage'
        });
      } catch (profileErr) {
        console.error("Error creating profile for new demo user:", profileErr);
      }
      
      // Auto-sign in the demo user
      const { data: autoSignIn, error: autoSignInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });
      
      if (!autoSignInError && autoSignIn.user) {
        console.log("Successfully signed in with newly created demo account");
        return { user: autoSignIn.user, role: "garage" };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Demo account handling error:", error);
    return null;
  }
};
