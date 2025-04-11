
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
  return email === "demo.garage@example.com";
};

export const handleDemoAccount = async (): Promise<{ user: any, role: "garage" } | null> => {
  try {
    const demoEmail = "demo.garage@example.com";
    const demoPassword = "garage123";
    
    // Try signing in first (if account exists)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword
    });

    if (!signInError && signInData.user) {
      console.log("Successfully signed in with demo account");
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
      await createUserProfile(signUpData.user.id, demoEmail, 'garage');
      
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
