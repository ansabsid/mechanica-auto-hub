
import { supabase } from "@/integrations/supabase/client";

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

export const isDemoAccount = (email: string): boolean => {
  return email === "demo@garage.com";
};

export const handleDemoAccount = async (): Promise<{ user: any, role: "garage" } | null> => {
  try {
    // Try signing in first (if account exists)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: "demo@garage.com",
      password: "garage123"
    });

    if (!signInError && signInData.user) {
      return { user: signInData.user, role: "garage" };
    }

    // If sign in fails, create a demo account and auto-confirm it
    console.log("Creating demo account...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: "demo@garage.com",
      password: "garage123",
      options: {
        data: { role: 'garage' }
      }
    });

    if (signUpError) {
      console.error("Error creating demo account:", signUpError);
      return null;
    }

    if (signUpData.user) {
      await createUserProfile(signUpData.user.id, "demo@garage.com", 'garage');
      
      // Auto-sign in the demo user
      const { data: autoSignIn, error: autoSignInError } = await supabase.auth.signInWithPassword({
        email: "demo@garage.com",
        password: "garage123"
      });
      
      if (!autoSignInError && autoSignIn.user) {
        return { user: autoSignIn.user, role: "garage" };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Demo account handling error:", error);
    return null;
  }
};
